import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { generateInvoicePDF } from '@/lib/invoice'

export async function GET(request, { params }) {
    try {
        const session = await auth()
        const { id } = await params
        const orderId = id

        await connectDB()

        const order = await Order.findById(orderId).lean()

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Authorization:
        // - Guests: only if order has guestEmail (no session required)
        // - Logged-in users: only their own orders
        // - Admins: all orders
        const isAdmin = session?.user?.role === 'admin'
        if (!isAdmin) {
            if (!session) {
                // No session — only guest orders allowed
                if (!order.guestEmail) {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
                }
            } else {
                // Has session — must be the order owner
                if (!order.user || order.user.toString() !== session.user.id) {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
                }
            }
        }

        // Generate PDF
        const pdfBuffer = await generateInvoicePDF(order)

        // Sanitize filename
        const safeOrderNumber = String(order.orderNumber).replace(/[^a-zA-Z0-9_-]/g, '')

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Invoice-${safeOrderNumber}.pdf"`,
                'Content-Length': String(pdfBuffer.length)
            }
        })

    } catch (error) {
        console.error('Invoice generation error:', error)
        return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
    }
}
