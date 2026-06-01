import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { sendOrderConfirmationEmail, sendShipmentConfirmationEmail } from '@/lib/email'
import { createForwardShipment } from '@/lib/shiprocket'
import { buildForwardShipmentPayload } from '@/lib/shiprocket-order'

// Get user's order history
export async function GET(request) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '10')
        const page = parseInt(searchParams.get('page') || '1')

        await connectDB()

        const query = { user: session.user.id }
        if (status && status !== 'all') {
            query.status = status
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean()

        const total = await Order.countDocuments(query)

        return NextResponse.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Get orders error:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}

// Create new order
export async function POST(request) {
    try {
        const session = await auth()
        const body = await request.json()

        const {
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            guestEmail,
            promoCode,
            giftOptions,
            subtotal,
            tax,
            shipping,
            discount,
            total
        } = body

        // Validation
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in order' }, { status: 400 })
        }

        if (!shippingAddress) {
            return NextResponse.json({ error: 'Shipping address required' }, { status: 400 })
        }

        if (!paymentMethod) {
            return NextResponse.json({ error: 'Payment method required' }, { status: 400 })
        }

        await connectDB()

        // Generate unique order number
        const orderCount = await Order.countDocuments()
        const orderNumber = `ORD${Date.now()}${String(orderCount + 1).padStart(4, '0')}`

        // Create order
        const orderData = {
            orderNumber,
            user: session?.user?.id,
            guestEmail: !session ? guestEmail : undefined,
            items,
            subtotal,
            tax,
            shipping,
            discount: discount || 0,
            total,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            payment: {
                method: paymentMethod,
                status: paymentMethod === 'cod' ? 'pending' : 'completed'
            },
            promoCode,
            giftOptions,
            status: 'pending',
            timeline: [{
                status: 'pending',
                timestamp: new Date(),
                note: 'Order placed'
            }]
        }

        const order = await Order.create(orderData)
        const emailAddress = session?.user?.email || guestEmail

        // Send order confirmation email
        try {
            if (emailAddress) {
                await sendOrderConfirmationEmail(emailAddress, order)
            }
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError)
        }

        // ── SHIPROCKET: Auto-create shipment for COD orders ──
        if (paymentMethod === 'cod') {
            try {
                const payload = buildForwardShipmentPayload(order)
                console.log('📦 Shiprocket forward payload:', JSON.stringify(payload, null, 2))

                const srResponse = await createForwardShipment(payload)
                console.log('📦 Shiprocket raw response:', JSON.stringify(srResponse, null, 2))

                // Shiprocket may return nested or flat structure
                const orderData = srResponse.payload || srResponse.data || srResponse.response?.data || srResponse
                console.log('📦 Shiprocket extracted orderData:', JSON.stringify(orderData, null, 2))

                const shiprocketOrderId = orderData.order_id || orderData.sr_order_id || orderData.id
                const shipmentId = orderData.shipment_id || orderData.shipmentId
                const awbCode = orderData.awb_code || orderData.awb || orderData.awbCode
                const courierName = orderData.courier_name || orderData.courierName
                const courierId = orderData.courier_company_id || orderData.courierId
                const labelUrl = orderData.label_url || orderData.labelUrl

                const shiprocketError = orderData.awb_assign_error || orderData.error || orderData.message

                if (!awbCode) {
                    console.warn('⚠️ Shiprocket returned success but no AWB. Reason:', shiprocketError)

                    // Still save Shiprocket order/shipment IDs for retry
                    order.shiprocket = {
                        orderId: String(shiprocketOrderId || ''),
                        shipmentId: String(shipmentId || ''),
                        awbCode: '',
                        courierId: null,
                        courierName: '',
                        labelUrl: '',
                        pickupStatus: 'pending',
                        lastSyncedAt: new Date()
                    }

                    order.timeline.push({
                        status: 'pending',
                        timestamp: new Date(),
                        note: `Shiprocket: Order created but AWB failed — ${shiprocketError || 'Unknown error'}`
                    })

                    await order.save()
                    throw new Error(shiprocketError || 'Shiprocket did not return an AWB code')
                }

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

                // Send shipment confirmation with tracking
                if (emailAddress && awbCode) {
                    try {
                        await sendShipmentConfirmationEmail(emailAddress, order)
                    } catch (emailErr) {
                        console.error('Failed to send shipment email:', emailErr)
                    }
                }

                console.log(`✅ Shiprocket COD shipment created for order ${order.orderNumber}: AWB ${awbCode}`)
            } catch (shiprocketErr) {
                console.error('❌ Shiprocket COD shipment creation failed (non-blocking):', shiprocketErr.message)
                order.timeline.push({
                    status: 'pending',
                    timestamp: new Date(),
                    note: `Order placed. Shiprocket shipment failed: ${shiprocketErr.message}`
                })
                await order.save()
            }
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                total: order.total,
                status: order.status,
                trackingNumber: order.shiprocket?.awbCode || null
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Create order error:', error)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
}
