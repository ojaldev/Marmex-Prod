import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/lib/auth'
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

        // Calculate rating summary using aggregation (single query, no N+1)
        const summaryAgg = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    five: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    four: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    three: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    two: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    one: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ])

        const summaryData = summaryAgg[0] || { total: 0, avgRating: 0, five: 0, four: 0, three: 0, two: 0, one: 0 }

        const ratingDistribution = {
            5: summaryData.five,
            4: summaryData.four,
            3: summaryData.three,
            2: summaryData.two,
            1: summaryData.one
        }

        return NextResponse.json({
            reviews,
            summary: {
                total: summaryData.total,
                average: Math.round(summaryData.avgRating * 10) / 10,
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
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Please login to submit a review' }, { status: 401 })
        }

        const body = await request.json()
        const { productId, rating, title, content, media } = body

        console.log('Review submission data:', { productId, rating, title, content: content?.substring(0, 50), media: media?.length })

        // Validation
        if (!productId || !rating || !title || !content) {
            console.log('Review validation failed:', {
                hasProductId: !!productId,
                hasRating: !!rating,
                hasTitle: !!title,
                hasContent: !!content
            })
            return NextResponse.json({
                error: 'Product ID, rating, title, and content are required',
                missing: {
                    productId: !productId,
                    rating: !rating,
                    title: !title,
                    content: !content
                }
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
