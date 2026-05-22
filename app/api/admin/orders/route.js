import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

/**
 * GET /api/admin/orders
 *
 * Admin-only endpoint to list all orders with filtering, sorting, and pagination.
 * Query params:
 *   - status: filter by order status
 *   - search: search by orderNumber or customer name
 *   - page: page number (default 1)
 *   - limit: items per page (default 20)
 *   - sort: sort field (default createdAt)
 *   - order: asc|desc (default desc)
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
        const sortField = searchParams.get('sort') || 'createdAt'
        const sortOrder = searchParams.get('order') === 'asc' ? 1 : -1

        await connectDB()

        // Build query
        const query = {}

        if (status && status !== 'all') {
            query.status = status
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i')
            query.$or = [
                { orderNumber: searchRegex },
                { 'shippingAddress.name': searchRegex },
                { 'shippingAddress.phone': searchRegex },
                { guestEmail: searchRegex }
            ]
        }

        // Execute query with pagination
        const skip = (page - 1) * limit

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(query)
        ])

        // Calculate stats
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                    processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
                    shipped: { $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] } },
                    delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                    returned: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } }
                }
            }
        ])

        // Calculate courier performance stats
        const courierStatsAgg = await Order.aggregate([
            { $match: { 'shiprocket.courierName': { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$shiprocket.courierName',
                    count: { $sum: 1 },
                    delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ])

        return NextResponse.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            stats: stats[0] || {
                totalOrders: 0, totalRevenue: 0,
                pending: 0, processing: 0, shipped: 0,
                delivered: 0, cancelled: 0, returned: 0
            },
            courierStats: courierStatsAgg.map(c => ({
                name: c._id,
                count: c.count,
                delivered: c.delivered
            }))
        })

    } catch (error) {
        console.error('Admin orders error:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}
