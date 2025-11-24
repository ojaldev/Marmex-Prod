import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Ticket from '@/models/Ticket'

// Get all tickets for user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        await connectDB()

        const query = { user: session.user.id }
        if (status && status !== 'all') {
            query.status = status
        }

        const tickets = await Ticket.find(query)
            .populate('order', 'orderNumber')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({ tickets })

    } catch (error) {
        console.error('Get tickets error:', error)
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }
}

// Create ticket
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { subject, category, priority, message, orderId, attachments } = body

        if (!subject || !category || !message) {
            return NextResponse.json({
                error: 'Subject, category, and message are required'
            }, { status: 400 })
        }

        await connectDB()

        const ticket = await Ticket.create({
            user: session.user.id,
            order: orderId || null,
            subject,
            category,
            priority: priority || 'medium',
            messages: [{
                sender: 'user',
                senderName: session.user.name,
                message,
                attachments: attachments || [],
                timestamp: new Date()
            }]
        })

        await ticket.populate('order', 'orderNumber')

        return NextResponse.json({
            success: true,
            ticket
        }, { status: 201 })

    } catch (error) {
        console.error('Create ticket error:', error)
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
    }
}
