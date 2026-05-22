import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

/**
 * POST /api/webhooks/shiprocket
 *
 * Receives real-time tracking updates from Shiprocket.
 * Setup in Shiprocket dashboard: Settings > API > Webhooks
 *
 * Webhook Payload:
 * {
 *   "awb": "19041424751540",
 *   "courier_name": "Delhivery Surface",
 *   "current_status": "IN TRANSIT",
 *   "current_status_id": 20,
 *   "shipment_status": "IN TRANSIT",
 *   "shipment_status_id": 18,
 *   "current_timestamp": "23 05 2023 11:43:52",
 *   "order_id": "1373900_150876814",
 *   "sr_order_id": 348456385,
 *   "awb assigned date": "2023-05-19 11:59:16"
 * }
 *
 * Status ID Mapping:
 *   6  → Shipped
 *   7  → Delivered
 *   8  → Canceled
 *   9  → RTO Initiated
 *   10 → RTO Delivered
 *   12 → Lost
 *   13 → Pickup Error
 *   14 → RTO Acknowledged
 *   15 → Pickup Rescheduled
 *   16 → Cancellation Requested
 *   17 → Out For Delivery
 *   18 → In Transit
 *   19 → Out For Pickup
 *   20 → Pickup Exception
 */

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

function parseWebhookTimestamp(ts) {
    if (!ts) return new Date()
    // Format: "23 05 2023 11:43:52" → Date object
    const parts = ts.trim().split(/[\s:]+/)
    if (parts.length >= 5) {
        const [day, month, year, hour, minute, second = '00'] = parts
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
    }
    return new Date()
}

export async function POST(request) {
    try {
        const payload = await request.json()

        console.log('📦 Shiprocket webhook received:', {
            awb: payload.awb,
            status: payload.current_status,
            statusId: payload.current_status_id,
            orderId: payload.order_id,
            srOrderId: payload.sr_order_id
        })

        // Optional: verify webhook security token
        const authHeader = request.headers.get('x-api-key') || request.headers.get('authorization')
        const expectedToken = process.env.SHIPROCKET_WEBHOOK_SECRET
        if (expectedToken && authHeader !== expectedToken && authHeader !== `Bearer ${expectedToken}`) {
            console.warn('⚠️ Shiprocket webhook: invalid auth token')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const {
            awb,
            courier_name,
            current_status,
            current_status_id,
            shipment_status,
            current_timestamp,
            order_id, // This is the Shiprocket order_id (our orderNumber)
            sr_order_id
        } = payload

        await connectDB()

        // Find order by Shiprocket AWB or Shiprocket order ID or our orderNumber
        let order = null

        // Try by AWB first (most reliable)
        if (awb) {
            order = await Order.findOne({ 'shiprocket.awbCode': String(awb) })
        }

        // Try by sr_order_id
        if (!order && sr_order_id) {
            order = await Order.findOne({ 'shiprocket.orderId': String(sr_order_id) })
        }

        // Try by order_id (our orderNumber)
        if (!order && order_id) {
            order = await Order.findOne({ orderNumber: String(order_id) })
        }

        if (!order) {
            console.warn('⚠️ Shiprocket webhook: order not found for', { awb, sr_order_id, order_id })
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Map Shiprocket status to Marmex status
        const mapped = STATUS_MAP[current_status_id]
        const eventTimestamp = parseWebhookTimestamp(current_timestamp)

        // Update tracking events
        if (!order.tracking) order.tracking = {}
        if (!order.tracking.events) order.tracking.events = []

        // Avoid duplicate events (check by status + timestamp within 1 min)
        const isDuplicate = order.tracking.events.some(e =>
            e.status === current_status &&
            Math.abs(new Date(e.timestamp) - eventTimestamp) < 60000
        )

        if (!isDuplicate) {
            order.tracking.events.push({
                status: current_status,
                location: '', // Shiprocket webhook doesn't always include location
                timestamp: eventTimestamp,
                description: mapped?.note || current_status
            })

            // Sort events by timestamp
            order.tracking.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        }

        // Update tracking meta
        order.tracking.carrier = courier_name || order.tracking.carrier || ''
        order.tracking.currentLocation = ''

        // Update Shiprocket sync info
        if (!order.shiprocket) order.shiprocket = {}
        order.shiprocket.lastSyncedAt = new Date()
        order.shiprocket.statusCode = current_status_id

        // Update order status if mapped
        if (mapped?.status && mapped.status !== order.status) {
            order.status = mapped.status
            order.timeline.push({
                status: mapped.status,
                timestamp: new Date(),
                note: `${mapped.note} (AWB: ${awb})`
            })

            // Special handling for delivered
            if (mapped.status === 'delivered') {
                order.timeline.push({
                    status: 'delivered',
                    timestamp: new Date(),
                    note: 'Order delivered. Thank you for shopping with Marmex India!'
                })
            }
        } else if (!isDuplicate && mapped?.note) {
            // Add timeline note even if status doesn't change
            order.timeline.push({
                status: order.status,
                timestamp: new Date(),
                note: `${mapped.note} (AWB: ${awb})`
            })
        }

        await order.save()

        console.log(`✅ Order ${order.orderNumber} updated: status=${order.status}, event=${current_status}`)

        return NextResponse.json({
            success: true,
            orderNumber: order.orderNumber,
            status: order.status,
            event: current_status
        })

    } catch (error) {
        console.error('❌ Shiprocket webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}

/**
 * GET handler for webhook verification (some services verify with GET first)
 */
export async function GET(request) {
    return NextResponse.json({
        message: 'Shiprocket webhook endpoint active',
        timestamp: new Date().toISOString()
    })
}
