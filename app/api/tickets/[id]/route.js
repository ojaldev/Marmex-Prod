import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Ticket from '@/models/Ticket'

// Get ticket details
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const ticketId = params.id

        await connectDB()

        const ticket = await Ticket.findById(ticketId)
            .populate('order')
            .populate('user', 'name email')

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
        }

        // Check authorization
        if (ticket.user._id.toString() !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json({ ticket })

    } catch (error) {
        console.error('Get ticket error:', error)
        return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 })
    }
}

// Update ticket (status, assignment, etc.)
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const ticketId = params.id
        const { status, priority, assignedTo, tags, rating, feedback } = await request.json()

        await connectDB()

        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
        }

        // Check authorization
        const isOwner = ticket.user.toString() === session.user.id
        const isAdmin = session.user.role === 'admin'

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Admin can update anything
        if (isAdmin) {
            if (status) ticket.status = status
            if (priority) ticket.priority = priority
            if (assignedTo !== undefined) ticket.assignedTo = assignedTo
            if (tags) ticket.tags = tags

            if (status === 'resolved') {
                ticket.resolvedAt = new Date()
            }
            if (status === 'closed') {
                ticket.closedAt = new Date()
            }
        }

        // User can only add rating/feedback if resolved
        if (isOwner && ticket.status === 'resolved') {
            if (rating) ticket.rating = rating
            if (feedback) ticket.feedback = feedback
        }

        await ticket.save()

        return NextResponse.json({
            success: true,
            ticket
        })

    } catch (error) {
        console.error('Update ticket error:', error)
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }
}
