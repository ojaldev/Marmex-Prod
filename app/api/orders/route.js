import { NextResponse } from 'next/server'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { sendOrderConfirmationEmail, sendShipmentConfirmationEmail } from '@/lib/email'
import { createForwardShipment } from '@/lib/shiprocket'
import { buildForwardShipmentPayload } from '@/lib/shiprocket-order'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

const orderItemSchema = z.object({
    productId: z.string().min(1),
    name: z.string().min(1),
    price: z.number().positive(),
    discount: z.number().min(0).max(100).default(0),
    quantity: z.number().int().min(1),
    image: z.string().optional()
})

const addressSchema = z.object({
    name: z.string().min(1),
    phone: z.string().min(7),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(4)
})

const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    paymentMethod: z.enum(['cod', 'card', 'upi', 'netbanking', 'wallet']),
    guestEmail: z.string().email().optional(),
    promoCode: z.string().optional(),
    giftOptions: z.object({ isGift: z.boolean().optional(), message: z.string().optional(), cost: z.number().optional() }).optional(),
    shippingMethod: z.object({ id: z.string().optional(), name: z.string(), cost: z.number().min(0), description: z.string().optional() }).optional(),
    subtotal: z.number().positive(),
    tax: z.number().min(0),
    shipping: z.number().min(0),
    discount: z.number().min(0),
    total: z.number().positive()
})

function getGstRate() {
    try {
        const raw = fs.readFileSync(
            path.join(process.cwd(), 'data', 'site-config.json'),
            'utf8'
        )
        return Number(JSON.parse(raw)?.pricing?.gstRate ?? 18)
    } catch {
        return 18
    }
}

// Get user's order history
export async function GET(request) {
    try {
        const session = await auth()

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
        // Rate limit: 5 orders per 10 minutes per IP
        const ip = getClientIP(request)
        const rateLimit = checkRateLimit(`order-create:${ip}`, 5, 10 * 60 * 1000)
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many order attempts. Please try again later.' },
                { status: 429 }
            )
        }

        const session = await auth()
        const body = await request.json()

        // Validate request body with Zod
        let validatedData
        try {
            validatedData = createOrderSchema.parse(body)
        } catch (zodError) {
            return NextResponse.json(
                { error: zodError.errors?.[0]?.message || 'Invalid order data' },
                { status: 400 }
            )
        }

        const {
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            guestEmail,
            promoCode,
            giftOptions,
            shippingMethod
        } = validatedData

        await connectDB()

        // ── SERVER-SIDE PRICE VALIDATION ──
        // Verify product prices from database to prevent tampering
        const productIds = items.map(item => item.productId)
        const products = await Product.find({ _id: { $in: productIds } }).select('price discount name').lean()
        const productMap = new Map(products.map(p => [p._id.toString(), p]))

        let serverSubtotal = 0
        const validatedItems = items.map(item => {
            const dbProduct = productMap.get(item.productId)
            // If product not found in DB, use client price but log warning
            const unitPrice = dbProduct ? dbProduct.price : item.price
            const unitDiscount = dbProduct ? (dbProduct.discount || 0) : item.discount
            const finalPrice = unitDiscount > 0
                ? unitPrice * (100 - unitDiscount) / 100
                : unitPrice
            const itemTotal = finalPrice * item.quantity
            serverSubtotal += itemTotal

            return {
                ...item,
                price: unitPrice,
                discount: unitDiscount
            }
        })

        // Read GST rate from config (falls back to 18% if config unreadable)
        const gstRate = getGstRate()
        // Recalculate totals server-side
        const serverTax = serverSubtotal * (gstRate / 100)
        const serverShipping = shippingMethod?.cost || 0
        const serverTotal = serverSubtotal + serverTax + serverShipping

        // Allow small tolerance for rounding differences (₹1)
        const tolerance = 1
        if (Math.abs(serverTotal - validatedData.total) > tolerance) {
            console.warn(`🚨 Price tampering detected: client=${validatedData.total}, server=${serverTotal}`)
            // Use server-calculated total but don't block the order
            // (could also return 400 if strict validation is preferred)
        }

        // Generate unique order number (collision-resistant, no race condition)
        const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

        // Create order with server-validated prices
        const orderData = {
            orderNumber,
            user: session?.user?.id,
            guestEmail: !session ? guestEmail : undefined,
            items: validatedItems,
            subtotal: Math.round(serverSubtotal * 100) / 100,
            tax: Math.round(serverTax * 100) / 100,
            taxRate: gstRate,
            shipping: serverShipping,
            discount: validatedData.discount || 0,
            total: Math.round(serverTotal * 100) / 100,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            payment: {
                method: paymentMethod,
                status: paymentMethod === 'cod' ? 'pending' : 'completed'
            },
            promoCode,
            giftOptions,
            shippingMethod,
            status: 'pending',
            timeline: [{
                status: 'pending',
                timestamp: new Date(),
                note: 'Order placed'
            }]
        }

        const order = await Order.create(orderData)
        const emailAddress = session?.user?.email || guestEmail

        // Send order confirmation email
        try {
            if (emailAddress) {
                await sendOrderConfirmationEmail(emailAddress, order)
            }
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError)
        }

        // ── SHIPROCKET: Auto-create shipment for COD orders ──
        if (paymentMethod === 'cod') {
            try {
                const payload = buildForwardShipmentPayload(order)
                console.log('📦 Shiprocket forward payload:', JSON.stringify(payload, null, 2))

                const srResponse = await createForwardShipment(payload)
                console.log('📦 Shiprocket raw response:', JSON.stringify(srResponse, null, 2))

                // Shiprocket may return nested or flat structure
                const orderData = srResponse.payload || srResponse.data || srResponse.response?.data || srResponse
                console.log('📦 Shiprocket extracted orderData:', JSON.stringify(orderData, null, 2))

                const shiprocketOrderId = orderData.order_id || orderData.sr_order_id || orderData.id
                const shipmentId = orderData.shipment_id || orderData.shipmentId
                const awbCode = orderData.awb_code || orderData.awb || orderData.awbCode
                const courierName = orderData.courier_name || orderData.courierName
                const courierId = orderData.courier_company_id || orderData.courierId
                const labelUrl = orderData.label_url || orderData.labelUrl

                const shiprocketError = orderData.awb_assign_error || orderData.error || orderData.message

                if (!awbCode) {
                    console.warn('⚠️ Shiprocket returned success but no AWB. Reason:', shiprocketError)

                    // Still save Shiprocket order/shipment IDs for retry
                    order.shiprocket = {
                        orderId: String(shiprocketOrderId || ''),
                        shipmentId: String(shipmentId || ''),
                        awbCode: '',
                        courierId: null,
                        courierName: '',
                        labelUrl: '',
                        pickupStatus: 'pending',
                        lastSyncedAt: new Date()
                    }

                    order.timeline.push({
                        status: 'pending',
                        timestamp: new Date(),
                        note: `Shiprocket: Order created but AWB failed — ${shiprocketError || 'Unknown error'}`
                    })

                    await order.save()
                    throw new Error(shiprocketError || 'Shiprocket did not return an AWB code')
                }

                order.shiprocket = {
                    orderId: String(shiprocketOrderId || ''),
                    shipmentId: String(shipmentId || ''),
                    awbCode: String(awbCode || ''),
                    courierId: courierId || null,
                    courierName: courierName || '',
                    labelUrl: labelUrl || '',
                    pickupStatus: 'scheduled',
                    lastSyncedAt: new Date()
                }

                order.tracking = {
                    ...order.tracking,
                    carrier: courierName || '',
                    trackingNumber: String(awbCode || '')
                }

                order.status = 'processing'
                order.timeline.push({
                    status: 'processing',
                    timestamp: new Date(),
                    note: `Shiprocket shipment created. AWB: ${awbCode}. Courier: ${courierName}`
                })

                await order.save()

                // Send shipment confirmation with tracking
                if (emailAddress && awbCode) {
                    try {
                        await sendShipmentConfirmationEmail(emailAddress, order)
                    } catch (emailErr) {
                        console.error('Failed to send shipment email:', emailErr)
                    }
                }

                console.log(`✅ Shiprocket COD shipment created for order ${order.orderNumber}: AWB ${awbCode}`)
            } catch (shiprocketErr) {
                console.error('❌ Shiprocket COD shipment creation failed (non-blocking):', shiprocketErr.message)
                order.timeline.push({
                    status: 'pending',
                    timestamp: new Date(),
                    note: `Order placed. Shiprocket shipment failed: ${shiprocketErr.message}`
                })
                await order.save()
            }
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                total: order.total,
                status: order.status,
                trackingNumber: order.shiprocket?.awbCode || null
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Create order error:', error)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
}
