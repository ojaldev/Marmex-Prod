import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import PromoCode from '@/models/PromoCode'

export async function PUT(request, { params }) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        await connectDB()

        const promo = await PromoCode.findByIdAndUpdate(
            id,
            {
                ...body,
                validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
                validUntil: body.validUntil ? new Date(body.validUntil) : undefined
            },
            { new: true }
        )

        if (!promo) {
            return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, promo })
    } catch (error) {
        console.error('Admin promo PUT error:', error)
        return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { id } = await params
        await connectDB()
        const promo = await PromoCode.findByIdAndDelete(id)

        if (!promo) {
            return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin promo DELETE error:', error)
        return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 })
    }
}
