import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const featured = searchParams.get('featured')
        const limit = parseInt(searchParams.get('limit') || '20')

        let query = {}

        if (featured === 'true') {
            query.featured = true
        }

        const testimonials = await Testimonial.find(query)
            .sort({ featured: -1, rating: -1, createdAt: -1 })
            .limit(limit)
            .populate('projectReference', 'title thumbnailImage')
            .lean()

        return NextResponse.json(testimonials)
    } catch (error) {
        console.error('Error fetching testimonials:', error)
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const testimonialData = await request.json()

        const testimonial = await Testimonial.create(testimonialData)

        return NextResponse.json(testimonial, { status: 201 })
    } catch (error) {
        console.error('Error creating testimonial:', error)
        return NextResponse.json({
            error: 'Failed to create testimonial',
            message: error.message
        }, { status: 500 })
    }
}
