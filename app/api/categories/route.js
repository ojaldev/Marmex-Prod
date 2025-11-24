import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const activeOnly = searchParams.get('active') !== 'false'

        let query = {}
        if (activeOnly) {
            query.active = true
        }

        const categories = await Category.find(query)
            .sort({ order: 1, name: 1 })
            .lean()

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

        const category = await Category.create(categoryData)

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json({
            error: 'Failed to create category',
            message: error.message
        }, { status: 500 })
    }
}
