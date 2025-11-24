import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const search = searchParams.get('search')
        const highlight = searchParams.get('highlight')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = (page - 1) * limit

        // Build query
        let query = {}

        if (category) {
            query.category = category
        }

        if (search) {
            query.$text = { $search: search }
        }

        if (highlight) {
            query.highlight = highlight
        }

        // Get products with pagination
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        // Get total count for pagination
        const total = await Product.countDocuments(query)

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const productData = await request.json()

        // Create new product
        const product = await Product.create(productData)

        return NextResponse.json(product, { status: 201 })
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json({
            error: 'Failed to create product',
            message: error.message
        }, { status: 500 })
    }
}
