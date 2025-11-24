import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function POST(request) {
    try {
        const headersList = headers()
        const signature = headersList.get('x-razorpay-signature')

        const body = await request.text()

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex')

        if (signature !== expectedSignature) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const event = JSON.parse(body)

        await connectDB()

        switch (event.event) {
            case 'payment.captured':
                await handlePaymentCaptured(event.payload.payment.entity)
                break

            case 'payment.failed':
                await handlePaymentFailed(event.payload.payment.entity)
                break

            case 'refund.processed':
                await handleRefundProcessed(event.payload.refund.entity)
                break

            default:
                console.log('Unhandled event:', event.event)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}

async function handlePaymentCaptured(payment) {
    const order = await Order.findOne({ 'payment.razorpayOrderId': payment.order_id })

    if (order && order.payment.status !== 'completed') {
        order.payment.status = 'completed'
        order.payment.transactionId = payment.id
        order.status = 'confirmed'
        order.timeline.push({
            status: 'confirmed',
            timestamp: new Date(),
            note: 'Payment captured successfully'
        })
        await order.save()
    }
}

async function handlePaymentFailed(payment) {
    const order = await Order.findOne({ 'payment.razorpayOrderId': payment.order_id })

    if (order) {
        order.payment.status = 'failed'
        order.status = 'cancelled'
        order.timeline.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: 'Payment failed'
        })
        await order.save()
    }
}

async function handleRefundProcessed(refund) {
    const order = await Order.findOne({ 'payment.transactionId': refund.payment_id })

    if (order) {
        order.refund = {
            status: 'completed',
            amount: refund.amount / 100,
            initiatedAt: order.refund?.initiatedAt || new Date(),
            completedAt: new Date(),
            refundId: refund.id,
            method: refund.payment_mode
        }
        await order.save()
    }
}
