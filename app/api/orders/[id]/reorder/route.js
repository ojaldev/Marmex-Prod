import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function POST(request, { params }) {
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

        // Check if user owns this order
        if (order.user.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Add all items from order to cart
        const items = order.items.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            discount: item.discount,
            quantity: item.quantity,
            image: item.image
        }))

        return NextResponse.json({
            success: true,
            items,
            message: 'Items added to cart successfully'
        })

    } catch (error) {
        console.error('Reorder error:', error)
        return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
    }
}
