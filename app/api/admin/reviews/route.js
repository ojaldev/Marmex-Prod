import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'

// Get all reviews for admin (including pending)
export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'all'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        let query = {}
        if (status !== 'all') {
            query.status = status
        }

        const reviews = await Review.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean()

        const total = await Review.countDocuments(query)

        // Get counts by status
        const pendingCount = await Review.countDocuments({ status: 'pending' })
        const approvedCount = await Review.countDocuments({ status: 'approved' })
        const rejectedCount = await Review.countDocuments({ status: 'rejected' })

        return NextResponse.json({
            reviews,
            counts: {
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
                total: pendingCount + approvedCount + rejectedCount
            },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Admin get reviews error:', error)
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
}
