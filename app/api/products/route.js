import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { validateDimensions, validateWeight, formatDimensions, formatWeight } from '@/lib/product-specs'

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

        // Get products with pagination — select only fields needed for listing
        const products = await Product.find(query)
            .select('name category price discount mainImage stock highlight shortDescription createdAt updatedAt')
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

        let productData = await request.json()

        // Validate & normalize dimensions if provided as structured object
        if (productData.dimensions && typeof productData.dimensions === 'object') {
            const dimValidation = validateDimensions(productData.dimensions)
            if (!dimValidation.valid) {
                return NextResponse.json({ error: dimValidation.error }, { status: 400 })
            }
            productData.dimensions = formatDimensions(productData.dimensions)
        }

        // Validate & normalize weight if provided as structured object
        if (productData.weight && typeof productData.weight === 'object') {
            const weightValidation = validateWeight(productData.weight)
            if (!weightValidation.valid) {
                return NextResponse.json({ error: weightValidation.error }, { status: 400 })
            }
            productData.weight = formatWeight(productData.weight)
        }

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
