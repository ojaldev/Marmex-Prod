import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Return from '@/models/Return'
import Order from '@/models/Order'
import { initiateRefund } from '@/lib/razorpay'
import { createReturnShipment } from '@/lib/shiprocket'

// Get return details
export async function GET(request, { params }) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const returnId = id

        await connectDB()

        const returnRequest = await Return.findById(returnId)
            .populate('order')
            .populate('user', 'name email')

        if (!returnRequest) {
            return NextResponse.json({ error: 'Return not found' }, { status: 404 })
        }

        // Check authorization
        if (returnRequest.user._id.toString() !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json({ return: returnRequest })

    } catch (error) {
        console.error('Get return error:', error)
        return NextResponse.json({ error: 'Failed to fetch return' }, { status: 500 })
    }
}

// Update return status (Admin only)
export async function PUT(request, { params }) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { id } = await params
        const returnId = id
        const { status, adminNotes, pickupScheduled, initiateRefund: shouldInitiateRefund } = await request.json()

        await connectDB()

        const returnRequest = await Return.findById(returnId).populate('order')

        if (!returnRequest) {
            return NextResponse.json({ error: 'Return not found' }, { status: 404 })
        }

        // Update status and timeline
        if (status) {
            returnRequest.status = status
            returnRequest.timeline.push({
                status,
                timestamp: new Date(),
                note: `Status updated to ${status} by admin`,
                updatedBy: session.user.email
            })

            if (status === 'completed') {
                returnRequest.resolutionDate = new Date()
            }
        }

        if (adminNotes) {
            returnRequest.adminNotes = adminNotes
        }

        if (pickupScheduled) {
            returnRequest.pickupScheduled = new Date(pickupScheduled)
        }

        // Create Shiprocket return shipment when approved
        if (status === 'approved') {
            try {
                const order = returnRequest.order
                const pickupAddr = returnRequest.pickupAddress || order.shippingAddress

                const returnPayload = {
                    order_id: `RET-${order.orderNumber}`,
                    order_date: new Date().toISOString().split('T')[0],
                    channel_id: order.shiprocket?.channelId || '',
                    pickup_customer_name: pickupAddr?.name?.split(' ')[0] || 'Customer',
                    pickup_last_name: pickupAddr?.name?.split(' ').slice(1).join(' ') || '',
                    pickup_address: pickupAddr?.line1 || '',
                    pickup_address_2: pickupAddr?.line2 || '',
                    pickup_city: pickupAddr?.city || '',
                    pickup_state: pickupAddr?.state || '',
                    pickup_country: 'India',
                    pickup_pincode: Number(pickupAddr?.pincode) || 0,
                    pickup_email: order.user?.email || order.guestEmail || 'customer@marmex.in',
                    pickup_phone: String(pickupAddr?.phone || ''),
                    pickup_isd_code: '91',
                    shipping_customer_name: process.env.SHIPROCKET_PICKUP_LOCATION || 'Warehouse',
                    shipping_address: 'Warehouse Address',
                    shipping_city: 'Warehouse City',
                    shipping_state: 'Warehouse State',
                    shipping_country: 'India',
                    shipping_pincode: Number(process.env.SHIPROCKET_PICKUP_PINCODE) || 110001,
                    shipping_email: process.env.SMTP_USER || 'warehouse@marmex.in',
                    shipping_phone: '9999999999',
                    shipping_isd_code: '91',
                    order_items: returnRequest.items.map(item => ({
                        name: item.productName || 'Product',
                        sku: item.productId?.toString() || 'SKU-001',
                        units: item.quantity,
                        selling_price: Math.round(item.refundAmount / item.quantity) || 0,
                        discount: 0,
                        qc_enable: true
                    })),
                    payment_method: order.payment?.method === 'cod' ? 'COD' : 'Prepaid',
                    sub_total: Math.round(returnRequest.refundAmount || 0)
                }

                const srResponse = await createReturnShipment(returnPayload)
                const responseData = srResponse.payload || srResponse.response?.data || srResponse

                returnRequest.timeline.push({
                    status: 'approved',
                    timestamp: new Date(),
                    note: `Shiprocket reverse pickup created. AWB: ${responseData.awb_code || responseData.awb}`,
                    updatedBy: session.user.email
                })

                console.log(`✅ Return shipment created for ${order.orderNumber}: AWB ${responseData.awb_code}`)
            } catch (shiprocketErr) {
                console.error('❌ Shiprocket return shipment failed (non-blocking):', shiprocketErr.message)
                returnRequest.timeline.push({
                    status: 'approved',
                    timestamp: new Date(),
                    note: `Approved. Shiprocket reverse pickup failed: ${shiprocketErr.message}`,
                    updatedBy: session.user.email
                })
            }
        }

        // Initiate refund if approved and has payment ID
        if (shouldInitiateRefund && status === 'approved' && returnRequest.order.payment.transactionId) {
            try {
                const refund = await initiateRefund(
                    returnRequest.order.payment.transactionId,
                    returnRequest.refundAmount,
                    {
                        return_id: returnRequest._id.toString(),
                        reason: returnRequest.reason
                    }
                )

                returnRequest.refundStatus = 'processing'
                returnRequest.refundId = refund.id

                // Update order refund status
                returnRequest.order.refund = {
                    status: 'processing',
                    amount: returnRequest.refundAmount,
                    initiatedAt: new Date(),
                    refundId: refund.id
                }
                await returnRequest.order.save()

            } catch (refundError) {
                console.error('Refund initiation error:', refundError)
                returnRequest.refundStatus = 'failed'
            }
        }

        await returnRequest.save()

        return NextResponse.json({
            success: true,
            return: returnRequest
        })

    } catch (error) {
        console.error('Update return error:', error)
        return NextResponse.json({ error: 'Failed to update return' }, { status: 500 })
    }
}

// Cancel return (User)
export async function DELETE(request, { params }) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const returnId = id

        await connectDB()

        const returnRequest = await Return.findById(returnId)

        if (!returnRequest) {
            return NextResponse.json({ error: 'Return not found' }, { status: 404 })
        }

        if (returnRequest.user.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Can only cancel if pending
        if (returnRequest.status !== 'pending') {
            return NextResponse.json({
                error: 'Can only cancel pending returns'
            }, { status: 400 })
        }

        returnRequest.status = 'cancelled'
        returnRequest.timeline.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: 'Cancelled by user'
        })

        await returnRequest.save()

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Cancel return error:', error)
        return NextResponse.json({ error: 'Failed to cancel return' }, { status: 500 })
    }
}
