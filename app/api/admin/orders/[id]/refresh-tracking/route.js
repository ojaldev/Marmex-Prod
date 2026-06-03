import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { trackByAwb } from '@/lib/shiprocket'

// Same mapping as webhook
const STATUS_MAP = {
    6: { status: 'shipped', note: 'Order shipped via courier' },
    7: { status: 'delivered', note: 'Order delivered successfully' },
    8: { status: 'cancelled', note: 'Shipment cancelled by courier' },
    9: { status: 'returned', note: 'RTO (Return to Origin) initiated' },
    10: { status: 'returned', note: 'RTO delivered back to origin' },
    12: { status: null, note: 'Shipment marked as lost by courier' },
    13: { status: null, note: 'Pickup error — courier could not collect' },
    14: { status: 'returned', note: 'RTO acknowledged by courier' },
    15: { status: null, note: 'Pickup rescheduled' },
    16: { status: null, note: 'Cancellation requested' },
    17: { status: 'shipped', note: 'Out for delivery' },
    18: { status: 'shipped', note: 'In transit' },
    19: { status: 'processing', note: 'Out for pickup' },
    20: { status: null, note: 'Pickup exception — address/issue' }
}

function parseTrackTimestamp(ts) {
    if (!ts) return new Date()
    const parts = String(ts).trim().split(/[\s:]+/)
    if (parts.length >= 5) {
        const [day, month, year, hour, minute, second = '00'] = parts
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
    }
    return new Date()
}

export async function GET(request, { params }) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { id } = await params
        await connectDB()

        const order = await Order.findById(id)
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        const awbCode = order.shiprocket?.awbCode
        if (!awbCode) {
            return NextResponse.json({
                success: false,
                message: 'No AWB code available for this order',
                order: { _id: order._id, orderNumber: order.orderNumber, status: order.status }
            })
        }

        // Poll Shiprocket for latest tracking
        const trackData = await trackByAwb(awbCode)
        const shipmentTrack = trackData?.tracking_data?.shipment_track?.[0]
        const activities = trackData?.tracking_data?.shipment_track_activities || []

        const statusCode = shipmentTrack?.status_code ?? shipmentTrack?.current_status_id
        const currentStatus = shipmentTrack?.current_status || shipmentTrack?.status
        const courierName = shipmentTrack?.courier_name || order.shiprocket?.courierName
        const currentTimestamp = shipmentTrack?.current_timestamp || shipmentTrack?.delivered_date

        const mapped = statusCode ? STATUS_MAP[statusCode] : null
        const eventTimestamp = parseTrackTimestamp(currentTimestamp)

        // Update tracking events from activities
        if (activities.length > 0) {
            if (!order.tracking) order.tracking = {}
            if (!order.tracking.events) order.tracking.events = []

            for (const act of activities) {
                const eventStatus = act.status || act.activity
                const eventDate = act.date ? new Date(act.date) : eventTimestamp
                const eventLocation = act.location || ''

                // Deduplicate
                const isDup = order.tracking.events.some(e =>
                    e.status === eventStatus &&
                    Math.abs(new Date(e.timestamp) - eventDate) < 60000
                )
                if (!isDup) {
                    order.tracking.events.push({
                        status: eventStatus,
                        location: eventLocation,
                        timestamp: eventDate,
                        description: act.activity || eventStatus
                    })
                }
            }
            order.tracking.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        }

        // Update tracking meta
        order.tracking.carrier = courierName || order.tracking.carrier || ''
        if (activities.length > 0) {
            const latest = activities[activities.length - 1]
            order.tracking.currentLocation = latest.location || ''
        }

        // Update Shiprocket sync info
        if (!order.shiprocket) order.shiprocket = {}
        order.shiprocket.lastSyncedAt = new Date()
        if (statusCode) order.shiprocket.statusCode = statusCode
        if (courierName) order.shiprocket.courierName = courierName

        // Update order status if mapped and changed
        let statusChanged = false
        if (mapped?.status && mapped.status !== order.status) {
            order.status = mapped.status
            order.timeline.push({
                status: mapped.status,
                timestamp: new Date(),
                note: `${mapped.note} (AWB: ${awbCode})`
            })
            if (mapped.status === 'delivered') {
                order.timeline.push({
                    status: 'delivered',
                    timestamp: new Date(),
                    note: 'Order delivered. Thank you for shopping with Marmex India!'
                })
            }
            statusChanged = true
        } else if (mapped?.note && activities.length === 0) {
            // No activities but status note available — add timeline note
            order.timeline.push({
                status: order.status,
                timestamp: new Date(),
                note: `${mapped.note} (AWB: ${awbCode})`
            })
        }

        await order.save()

        return NextResponse.json({
            success: true,
            statusChanged,
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                shiprocket: order.shiprocket,
                tracking: order.tracking
            }
        })

    } catch (error) {
        console.error('Refresh tracking error:', error)
        return NextResponse.json({
            error: 'Failed to refresh tracking',
            message: error.message
        }, { status: 500 })
    }
}
