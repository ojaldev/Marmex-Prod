import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { createForwardShipment } from '@/lib/shiprocket'
import { buildForwardShipmentPayload } from '@/lib/shiprocket-order'

/**
 * POST /api/shiprocket/create-shipment
 * 
 * Creates a Shiprocket forward shipment for an existing order.
 * This is called after payment is confirmed (online) or order is placed (COD).
 * 
 * Body: { orderId: string }
 */
export async function POST(request) {
    try {
        // Optional auth check — admin or system can call this
        const session = await auth().catch(() => null)

        const { orderId } = await request.json()

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
        }

        await connectDB()

        // Load order with full details
        const order = await Order.findById(orderId)

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Check if shipment already created
        if (order.shiprocket?.awbCode) {
            return NextResponse.json({
                success: true,
                message: 'Shipment already exists',
                shipment: order.shiprocket
            })
        }

        // Build Shiprocket payload
        const payload = buildForwardShipmentPayload(order)

        // Call Shiprocket Forward Shipment API
        const srResponse = await createForwardShipment(payload)

        // Extract key data from response
        const payloadData = srResponse.payload || srResponse
        const orderData = payloadData.order_id ? payloadData : (srResponse.response?.data || {})

        const shiprocketOrderId = orderData.order_id || orderData.sr_order_id
        const shipmentId = orderData.shipment_id
        const awbCode = orderData.awb_code || orderData.awb
        const courierName = orderData.courier_name
        const courierId = orderData.courier_company_id
        const labelUrl = orderData.label_url
        const manifestUrl = orderData.manifest_url

        // Update order with Shiprocket details
        order.shiprocket = {
            orderId: String(shiprocketOrderId || ''),
            shipmentId: String(shipmentId || ''),
            awbCode: String(awbCode || ''),
            courierId: courierId || null,
            courierName: courierName || '',
            labelUrl: labelUrl || '',
            manifestUrl: manifestUrl || '',
            pickupStatus: 'scheduled',
            lastSyncedAt: new Date()
        }

        // Update tracking info
        order.tracking = {
            ...order.tracking,
            carrier: courierName || '',
            trackingNumber: String(awbCode || ''),
            estimatedDelivery: order.deliveryDate || null
        }

        // Update status and timeline
        order.status = 'processing'
        order.timeline.push({
            status: 'processing',
            timestamp: new Date(),
            note: `Shiprocket shipment created. AWB: ${awbCode}. Courier: ${courierName}`
        })

        await order.save()

        return NextResponse.json({
            success: true,
            message: 'Shipment created successfully',
            shipment: {
                shiprocketOrderId,
                shipmentId,
                awbCode,
                courierName,
                labelUrl,
                manifestUrl
            }
        })

    } catch (error) {
        console.error('Create shipment error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create shipment' },
            { status: 500 }
        )
    }
}
