import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'

// Get single review
export async function GET(request, { params }) {
    try {
        await connectDB()

        const review = await Review.findById(params.id)
            .populate('user', 'name email')
            .lean()

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        return NextResponse.json(review)

    } catch (error) {
        console.error('Get review error:', error)
        return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
    }
}

// Update review status (approve/reject)
export async function PUT(request, { params }) {
    try {
        await connectDB()

        const body = await request.json()
        const { status, adminNote } = body

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({
                error: 'Invalid status. Must be: approved, rejected, or pending'
            }, { status: 400 })
        }

        const review = await Review.findByIdAndUpdate(
            params.id,
            {
                status,
                adminNote: adminNote || '',
                reviewedAt: new Date()
            },
            { new: true }
        ).populate('user', 'name email')

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        console.log(`Review ${params.id} status updated to: ${status}`)

        return NextResponse.json({
            success: true,
            message: `Review ${status} successfully`,
            review
        })

    } catch (error) {
        console.error('Update review error:', error)
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }
}

// Delete review
export async function DELETE(request, { params }) {
    try {
        await connectDB()

        const review = await Review.findByIdAndDelete(params.id)

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: 'Review deleted successfully' })

    } catch (error) {
        console.error('Delete review error:', error)
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
    }
}
