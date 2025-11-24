import { NextResponse } from 'next/server'
import { verifyPaymentSignature, getPaymentDetails } from '@/lib/razorpay'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import PromoCode from '@/models/PromoCode'

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

        return NextResponse.json({
            success: true,
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status
            }
        })

    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
    }
}
