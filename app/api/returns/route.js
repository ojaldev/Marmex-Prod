import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Return from '@/models/Return'
import Order from '@/models/Order'

// Get all returns for user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        await connectDB()

        const query = { user: session.user.id }
        if (status && status !== 'all') {
            query.status = status
        }

        const returns = await Return.find(query)
            .populate('order', 'orderNumber createdAt')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({ returns })

    } catch (error) {
        console.error('Get returns error:', error)
        return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 })
    }
}

// Create return request
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { orderId, items, type, reason, comments, images, pickupAddress } = body

        if (!orderId || !items || !type || !reason) {
            return NextResponse.json({
                error: 'Order ID, items, type, and reason are required'
            }, { status: 400 })
        }

        await connectDB()

        // Verify order belongs to user
        const order = await Order.findById(orderId)

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        if (order.user.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Check if order is eligible for return (within 30 days)
        const orderDate = new Date(order.createdAt)
        const now = new Date()
        const daysSinceOrder = (now - orderDate) / (1000 * 60 * 60 * 24)

        if (daysSinceOrder > 30) {
            return NextResponse.json({
                error: 'Return period has expired (30 days from order date)'
            }, { status: 400 })
        }

        // Calculate refund amount
        let refundAmount = 0
        items.forEach(item => {
            const orderItem = order.items.find(oi => oi.productId === item.productId)
            if (orderItem) {
                refundAmount += (orderItem.price - orderItem.discount) * item.quantity
            }
        })

        // Create return request
        const returnRequest = await Return.create({
            order: orderId,
            user: session.user.id,
            items,
            type,
            reason,
            comments,
            images: images || [],
            pickupAddress: pickupAddress || order.shippingAddress,
            refundAmount,
            status: 'pending'
        })

        return NextResponse.json({
            success: true,
            return: returnRequest
        }, { status: 201 })

    } catch (error) {
        console.error('Create return error:', error)
        return NextResponse.json({ error: 'Failed to create return request' }, { status: 500 })
    }
}
