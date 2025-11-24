import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { generateInvoicePDF } from '@/lib/invoice'

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        const orderId = params.id

        await connectDB()

        const order = await Order.findById(orderId)

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Check authorization
        if (!session && !order.guestEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session && order.user && order.user.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Generate PDF
        const pdfBuffer = await generateInvoicePDF(order)

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Invoice-${order.orderNumber}.pdf"`
            }
        })

    } catch (error) {
        console.error('Invoice generation error:', error)
        return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
    }
}
