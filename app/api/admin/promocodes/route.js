import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import PromoCode from '@/models/PromoCode'

export async function GET(request) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        await connectDB()
        const promos = await PromoCode.find().sort({ createdAt: -1 }).lean()
        return NextResponse.json({ promos })
    } catch (error) {
        console.error('Admin promos GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await request.json()
        const {
            code, type, value, minOrderValue,
            maxDiscount, validFrom, validUntil,
            usageLimit, active, description
        } = body

        if (!code || !type || value == null || !validFrom || !validUntil) {
            return NextResponse.json({ error: 'Code, type, value, validFrom, validUntil are required' }, { status: 400 })
        }

        await connectDB()

        const promo = await PromoCode.create({
            code: code.toUpperCase().trim(),
            type,
            value: Number(value),
            minOrderValue: Number(minOrderValue) || 0,
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            validFrom: new Date(validFrom),
            validUntil: new Date(validUntil),
            usageLimit: usageLimit ? Number(usageLimit) : null,
            active: active !== false,
            description: description || ''
        })

        return NextResponse.json({ success: true, promo })
    } catch (error) {
        console.error('Admin promo POST error:', error)
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Promo code already exists' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 })
    }
}
