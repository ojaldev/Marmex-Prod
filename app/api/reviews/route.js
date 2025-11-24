import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Review from '@/models/Review'

// Get reviews for a product
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')
        const sort = searchParams.get('sort') || 'newest'
        const rating = searchParams.get('rating')
        const limit = parseInt(searchParams.get('limit') || '10')
        const page = parseInt(searchParams.get('page') || '1')

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }

        await connectDB()

        const query = {
            product: productId,
            status: 'approved' // Only show approved reviews
        }

        if (rating) {
            query.rating = parseInt(rating)
        }

        let sortQuery = {}
        switch (sort) {
            case 'newest':
                sortQuery = { createdAt: -1 }
                break
            case 'oldest':
                sortQuery = { createdAt: 1 }
                break
            case 'highest':
                sortQuery = { rating: -1, createdAt: -1 }
                break
            case 'lowest':
                sortQuery = { rating: 1, createdAt: -1 }
                break
            case 'helpful':
                sortQuery = { 'helpful.length': -1, createdAt: -1 }
                break
            default:
                sortQuery = { createdAt: -1 }
        }

        const reviews = await Review.find(query)
            .populate('user', 'name photo')
            .sort(sortQuery)
            .limit(limit)
            .skip((page - 1) * limit)
            .lean()

        const total = await Review.countDocuments(query)

        // Calculate rating summary
        const allReviews = await Review.find({ product: productId, status: 'approved' })
        const avgRating = allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : 0

        const ratingDistribution = {
            5: allReviews.filter(r => r.rating === 5).length,
            4: allReviews.filter(r => r.rating === 4).length,
            3: allReviews.filter(r => r.rating === 3).length,
            2: allReviews.filter(r => r.rating === 2).length,
            1: allReviews.filter(r => r.rating === 1).length
        }

        return NextResponse.json({
            reviews,
            summary: {
                total: allReviews.length,
                average: Math.round(avgRating * 10) / 10,
                distribution: ratingDistribution
            },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Get reviews error:', error)
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
}

// Submit a review
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Please login to submit a review' }, { status: 401 })
        }

        const body = await request.json()
        const { productId, rating, title, content, media } = body

        // Validation
        if (!productId || !rating || !title || !content) {
            return NextResponse.json({
                error: 'Product ID, rating, title, and content are required'
            }, { status: 400 })
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
        }

        await connectDB()

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: session.user.id
        })

        if (existingReview) {
            return NextResponse.json({
                error: 'You have already reviewed this product'
            }, { status: 400 })
        }

        // Create review
        const review = await Review.create({
            product: productId,
            user: session.user.id,
            rating,
            title,
            content,
            media: media || [],
            verified: false, // TODO: Check if user purchased this product
            status: 'pending' // Requires approval
        })

        await review.populate('user', 'name photo')

        return NextResponse.json({
            success: true,
            review
        }, { status: 201 })

    } catch (error) {
        console.error('Submit review error:', error)
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }
}
