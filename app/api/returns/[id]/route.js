import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Return from '@/models/Return'
import Order from '@/models/Order'
import { initiateRefund } from '@/lib/razorpay'

// Get return details
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const returnId = params.id

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
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const returnId = params.id
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
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const returnId = params.id

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
