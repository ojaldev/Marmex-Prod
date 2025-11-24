import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createRazorpayOrder } from '@/lib/razorpay'

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        const { amount, orderId, customerInfo } = await request.json()

        if (!amount || !orderId) {
            return NextResponse.json({ error: 'Amount and order ID required' }, { status: 400 })
        }

        // Create Razorpay order
        const razorpayOrder = await createRazorpayOrder(
            amount,
            orderId,
            {
                customer_name: customerInfo?.name || session?.user?.name || 'Guest',
                customer_email: customerInfo?.email || session?.user?.email || '',
                order_id: orderId
            }
        )

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
