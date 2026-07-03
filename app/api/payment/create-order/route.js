import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { createRazorpayOrder } from '@/lib/razorpay'

export async function POST(request) {
    try {
        const session = await auth()
        const { orderId, customerInfo } = await request.json()

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
        }

        await connectDB()
        const order = await Order.findById(orderId).lean()
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Logged-in users may only pay for their own orders.
        // Guest orders (no order.user) are allowed without a session.
        if (order.user && (!session || order.user.toString() !== session.user.id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Server-authoritative amount — never trust the client.
        const amount = order.total

        const razorpayOrder = await createRazorpayOrder(amount, orderId, {
            customer_name: customerInfo?.name || session?.user?.name || 'Guest',
            customer_email: customerInfo?.email || session?.user?.email || '',
            order_id: orderId
        })

        return NextResponse.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        })

    } catch (error) {
        console.error('Create order error:', error)
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
    }
}
