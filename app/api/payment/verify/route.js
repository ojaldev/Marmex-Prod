import { NextResponse } from 'next/server'
import { verifyPaymentSignature, getPaymentDetails } from '@/lib/razorpay'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import PromoCode from '@/models/PromoCode'
import { createForwardShipment } from '@/lib/shiprocket'
import { buildForwardShipmentPayload } from '@/lib/shiprocket-order'
import { sendShipmentConfirmationEmail } from '@/lib/email'

export async function POST(request) {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            orderId,
            promoCode
        } = await request.json()

        // Verify payment signature
        const isValid = verifyPaymentSignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        )

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await getPaymentDetails(razorpayPaymentId)

        if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
            return NextResponse.json({ error: 'Payment not successful' }, { status: 400 })
        }

        await connectDB()

        // Update order with payment information
        const order = await Order.findById(orderId)

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Update order
        order.payment.status = 'completed'
        order.payment.transactionId = razorpayPaymentId
        order.payment.razorpayOrderId = razorpayOrderId
        order.status = 'confirmed'
        order.timeline.push({
            status: 'confirmed',
            timestamp: new Date(),
            note: 'Payment received and order confirmed'
        })

        await order.save()

        // Update promo code usage if applicable
        if (promoCode) {
            await PromoCode.findOneAndUpdate(
                { code: promoCode },
                {
                    $inc: { usedCount: 1 },
                    $push: { usedBy: order.user }
                }
            )
        }

        // ── SHIPROCKET: Auto-create shipment ──
        try {
            const payload = buildForwardShipmentPayload(order)
            const srResponse = await createForwardShipment(payload)

            const orderData = srResponse.payload || srResponse.response?.data || srResponse
            const shiprocketOrderId = orderData.order_id || orderData.sr_order_id
            const shipmentId = orderData.shipment_id
            const awbCode = orderData.awb_code || orderData.awb
            const courierName = orderData.courier_name
            const courierId = orderData.courier_company_id
            const labelUrl = orderData.label_url

            // Update order with Shiprocket details
            order.shiprocket = {
                orderId: String(shiprocketOrderId || ''),
                shipmentId: String(shipmentId || ''),
                awbCode: String(awbCode || ''),
                courierId: courierId || null,
                courierName: courierName || '',
                labelUrl: labelUrl || '',
                pickupStatus: 'scheduled',
                lastSyncedAt: new Date()
            }

            order.tracking = {
                ...order.tracking,
                carrier: courierName || '',
                trackingNumber: String(awbCode || '')
            }

            order.status = 'processing'
            order.timeline.push({
                status: 'processing',
                timestamp: new Date(),
                note: `Shiprocket shipment created. AWB: ${awbCode}. Courier: ${courierName}`
            })

            await order.save()

            // Send shipment confirmation email with tracking
            const customerEmail = order.user?.email || order.guestEmail
            if (customerEmail && awbCode) {
                try {
                    await sendShipmentConfirmationEmail(customerEmail, order)
                } catch (emailErr) {
                    console.error('Failed to send shipment email:', emailErr)
                }
            }

            console.log(`✅ Shiprocket shipment created for order ${order.orderNumber}: AWB ${awbCode}`)
        } catch (shiprocketErr) {
            // Log but don't fail the payment verification
            console.error('❌ Shiprocket shipment creation failed (non-blocking):', shiprocketErr.message)
            order.timeline.push({
                status: 'confirmed',
                timestamp: new Date(),
                note: `Payment confirmed. Shiprocket shipment failed: ${shiprocketErr.message}`
            })
            await order.save()
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                trackingNumber: order.shiprocket?.awbCode || null
            }
        })

    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
    }
}
