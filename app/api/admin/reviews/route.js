import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'

// Get all reviews for admin
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'pending'

        await connectDB()

        const reviews = await Review.find({ status })
            .populate('user', 'name email photo')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({ reviews })

    } catch (error) {
        console.error('Admin get reviews error:', error)
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
}
