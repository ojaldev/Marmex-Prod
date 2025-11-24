import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'

export async function GET(request, { params }) {
    try {
        const { id } = await params

        await connectDB()

        const testimonial = await Testimonial.findById(id)
            .populate('projectReference', 'title thumbnailImage')
            .lean()

        if (!testimonial) {
            return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
        }

        return NextResponse.json(testimonial)
    } catch (error) {
        console.error('Error fetching testimonial:', error)
        return NextResponse.json({ error: 'Failed to fetch testimonial' }, { status: 500 })
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params
        const updateData = await request.json()

        await connectDB()

        const testimonial = await Testimonial.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )

        if (!testimonial) {
            return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
        }

        return NextResponse.json(testimonial)
    } catch (error) {
        console.error('Error updating testimonial:', error)
        return NextResponse.json({
            error: 'Failed to update testimonial',
            message: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params

        await connectDB()

        const testimonial = await Testimonial.findByIdAndDelete(id)

        if (!testimonial) {
            return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Testimonial deleted successfully' })
    } catch (error) {
        console.error('Error deleting testimonial:', error)
        return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
    }
}
