import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Return from '@/models/Return'

/**
 * GET /api/admin/returns
 *
 * Admin-only endpoint to list all return requests.
 * Query params:
 *   - status: filter by return status
 *   - search: search by orderNumber or customer name
 *   - page: page number (default 1)
 *   - limit: items per page (default 20)
 */
export async function GET(request) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        await connectDB()

        const query = {}

        if (status && status !== 'all') {
            query.status = status
        }

        const skip = (page - 1) * limit

        // Aggregate to allow searching by populated order fields
        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order',
                    foreignField: '_id',
                    as: 'orderDoc'
                }
            },
            { $unwind: { path: '$orderDoc', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDoc'
                }
            },
            { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } }
        ]

        if (search) {
            const searchRegex = new RegExp(search, 'i')
            pipeline.push({
                $match: {
                    $or: [
                        { 'orderDoc.orderNumber': searchRegex },
                        { 'orderDoc.shippingAddress.name': searchRegex },
                        { 'orderDoc.guestEmail': searchRegex },
                        { 'userDoc.name': searchRegex },
                        { 'userDoc.email': searchRegex }
                    ]
                }
            })
        }

        const countPipeline = [...pipeline, { $count: 'total' }]
        const dataPipeline = [
            ...pipeline,
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]

        const [countResult, returns] = await Promise.all([
            Return.aggregate(countPipeline),
            Return.aggregate(dataPipeline)
        ])

        const total = countResult[0]?.total || 0

        // Get status counts
        const statusCounts = await Return.aggregate([
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
            }}
        ])

        const counts = {
            total,
            pending: 0, approved: 0, rejected: 0, picked_up: 0,
            processing: 0, completed: 0, cancelled: 0
        }
        statusCounts.forEach(s => { counts[s._id] = s.count })

        return NextResponse.json({
            returns,
            counts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Admin returns error:', error)
        return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 })
    }
}
