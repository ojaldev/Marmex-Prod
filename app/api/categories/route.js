import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const activeParam = searchParams.get('active')

        let query = {}
        // Only filter by active if explicitly set to 'true'
        if (activeParam === 'true') {
            query.active = true
        }

        const categories = await Category.find(query)
            .sort({ order: 1, name: 1 })
            .lean()

        console.log('Categories fetched:', categories.length, 'Query:', query)

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const categoryData = await request.json()

        // Generate slug if not provided
        if (!categoryData.slug && categoryData.name) {
            categoryData.slug = categoryData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
        }

        console.log('Creating category with data:', categoryData)

        // Use new + save instead of create for better error handling
        const category = new Category(categoryData)
        await category.save()

        console.log('Category created successfully:', category._id)

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json({
            error: 'Failed to create category',
            message: error.message
        }, { status: 500 })
    }
}

