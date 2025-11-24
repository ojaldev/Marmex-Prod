import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const orderId = params.id
        const { carrier, trackingNumber, estimatedDelivery, currentLocation, event } = await request.json()

        await connectDB()

        const order = await Order.findById(orderId)

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Update tracking info
        if (carrier) order.tracking.carrier = carrier
        if (trackingNumber) order.tracking.trackingNumber = trackingNumber
        if (estimatedDelivery) order.tracking.estimatedDelivery = new Date(estimatedDelivery)
        if (currentLocation) order.tracking.currentLocation = currentLocation

        // Add tracking event
        if (event) {
            if (!order.tracking.events) order.tracking.events = []
            order.tracking.events.push({
                status: event.status,
                location: event.location,
                timestamp: new Date(),
                description: event.description
            })
        }

        await order.save()

        return NextResponse.json({
            success: true,
            tracking: order.tracking
        })

    } catch (error) {
        console.error('Update tracking error:', error)
        return NextResponse.json({ error: 'Failed to update tracking' }, { status: 500 })
    }
}
