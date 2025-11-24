import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'

// Mark review as helpful
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const reviewId = params.id

        await connectDB()

        const review = await Review.findById(reviewId)

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        // Toggle helpful
        const userIndex = review.helpful.indexOf(session.user.id)

        if (userIndex > -1) {
            // Remove if already marked
            review.helpful.splice(userIndex, 1)
        } else {
            // Add if not marked
            review.helpful.push(session.user.id)
        }

        await review.save()

        return NextResponse.json({
            success: true,
            helpfulCount: review.helpful.length,
            isHelpful: userIndex === -1
        })

    } catch (error) {
        console.error('Mark helpful error:', error)
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }
}
