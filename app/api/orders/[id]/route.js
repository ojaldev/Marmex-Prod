import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

// Get order details
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        const orderId = params.id

        await connectDB()

        const order = await Order.findById(orderId).lean()

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Check authorization - user can only view their own orders
        if (session) {
            if (order.user && order.user.toString() !== session.user.id) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
            }
        } else {
            // For guest orders, we would need email verification or order token
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json({ order })

    } catch (error) {
        console.error('Get order error:', error)
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
    }
}

// Update order (admin only for now)
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const orderId = params.id
        const body = await request.json()

        await connectDB()

        const order = await Order.findById(orderId)

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Update fields
        if (body.status) {
            order.status = body.status
            order.timeline.push({
                status: body.status,
                timestamp: new Date(),
                note: body.note || `Order status changed to ${body.status}`
            })
        }

        if (body.tracking) {
            order.tracking = {
                ...order.tracking,
                ...body.tracking
            }
        }

        await order.save()

        return NextResponse.json({
            success: true,
            order
        })

    } catch (error) {
        console.error('Update order error:', error)
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }
}

// Cancel order
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const orderId = params.id

        await connectDB()

        const order = await Order.findById(orderId)

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Check authorization
        if (order.user.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Can only cancel pending or confirmed orders
        if (!['pending', 'confirmed'].includes(order.status)) {
            return NextResponse.json({
                error: 'Order cannot be cancelled at this stage'
            }, { status: 400 })
        }

        order.status = 'cancelled'
        order.cancelledAt = new Date()
        order.timeline.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: 'Order cancelled by customer'
        })

        await order.save()

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully'
        })

    } catch (error) {
        console.error('Cancel order error:', error)
        return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
    }
}
