import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { sendOrderConfirmationEmail } from '@/lib/email'

// Get user's order history
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '10')
        const page = parseInt(searchParams.get('page') || '1')

        await connectDB()

        const query = { user: session.user.id }
        if (status && status !== 'all') {
            query.status = status
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean()

        const total = await Order.countDocuments(query)

        return NextResponse.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Get orders error:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}

// Create new order
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        const body = await request.json()

        const {
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            guestEmail,
            promoCode,
            giftOptions,
            subtotal,
            tax,
            shipping,
            discount,
            total
        } = body

        // Validation
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in order' }, { status: 400 })
        }

        if (!shippingAddress) {
            return NextResponse.json({ error: 'Shipping address required' }, { status: 400 })
        }

        if (!paymentMethod) {
            return NextResponse.json({ error: 'Payment method required' }, { status: 400 })
        }

        await connectDB()

        // Create order
        const orderData = {
            user: session?.user?.id,
            guestEmail: !session ? guestEmail : undefined,
            items,
            subtotal,
            tax,
            shipping,
            discount: discount || 0,
            total,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            payment: {
                method: paymentMethod,
                status: paymentMethod === 'cod' ? 'pending' : 'completed'
            },
            promoCode,
            giftOptions,
            status: 'pending',
            timeline: [{
                status: 'pending',
                timestamp: new Date(),
                note: 'Order placed'
            }]
        }

        const order = await Order.create(orderData)

        // Send order confirmation email
        try {
            const emailAddress = session?.user?.email || guestEmail
            if (emailAddress) {
                await sendOrderConfirmationEmail(emailAddress, order)
            }
        } catch (emailError) {
            // Log error but don't fail order creation
            console.error('Failed to send confirmation email:', emailError)
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                total: order.total,
                status: order.status
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Create order error:', error)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
}
