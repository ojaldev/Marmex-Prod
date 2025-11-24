import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Ticket from '@/models/Ticket'

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const ticketId = params.id
        const { message, attachments } = await request.json()

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

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

        // Add message
        ticket.messages.push({
            sender: isAdmin ? 'admin' : 'user',
            senderName: session.user.name,
            message,
            attachments: attachments || [],
            timestamp: new Date()
        })

        // Update ticket status if admin replied
        if (isAdmin && ticket.status === 'open') {
            ticket.status = 'in_progress'
        }

        // If user replied to waiting_customer, move to in_progress
        if (isOwner && ticket.status === 'waiting_customer') {
            ticket.status = 'in_progress'
        }

        await ticket.save()

        return NextResponse.json({
            success: true,
            ticket
        })

    } catch (error) {
        console.error('Add message error:', error)
        return NextResponse.json({ error: 'Failed to add message' }, { status: 500 })
    }
}
