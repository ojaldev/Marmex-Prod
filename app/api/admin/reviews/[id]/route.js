import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'

// Update review status
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const reviewId = params.id
        const { status } = await request.json()

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        await connectDB()

        const review = await Review.findByIdAndUpdate(
            reviewId,
            { status },
            { new: true }
        )

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, review })

    } catch (error) {
        console.error('Update review error:', error)
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }
}

// Delete review
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const reviewId = params.id

        await connectDB()

        const review = await Review.findByIdAndDelete(reviewId)

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete review error:', error)
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
    }
}
