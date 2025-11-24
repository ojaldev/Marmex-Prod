import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import PromoCode from '@/models/PromoCode'

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        const { code, orderTotal } = await request.json()

        if (!code || !orderTotal) {
            return NextResponse.json({ error: 'Code and order total required' }, { status: 400 })
        }

        await connectDB()

        const promoCode = await PromoCode.findOne({
            code: code.toUpperCase().trim()
        })

        if (!promoCode) {
            return NextResponse.json({
                error: 'Invalid promo code'
            }, { status: 404 })
        }

        // Validate promo code
        const validation = promoCode.isValid(session?.user?.id, orderTotal)

        if (!validation.valid) {
            return NextResponse.json({
                error: validation.message
            }, { status: 400 })
        }

        // Calculate discount
        const discount = promoCode.calculateDiscount(orderTotal)

        return NextResponse.json({
            success: true,
            promoCode: {
                code: promoCode.code,
                type: promoCode.type,
                value: promoCode.value,
                discount,
                description: promoCode.description
            }
        })

    } catch (error) {
        console.error('Validate promo error:', error)
        return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 })
    }
}
