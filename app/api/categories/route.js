import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const activeParam = searchParams.get('active')
        const withProducts = searchParams.get('withProducts') === 'true'

        let query = {}
        if (activeParam === 'true') {
            query.active = true
        }

        const categories = await Category.find(query)
            .sort({ order: 1, name: 1 })
            .lean()

        if (withProducts) {
            // Get all category names that have at least one product — single query
            const populated = await Product.distinct('category')
            const populatedSet = new Set(populated)
            const filtered = categories.filter(c => populatedSet.has(c.name))
            return NextResponse.json(filtered, {
                headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
            })
        }

        return NextResponse.json(categories, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const denied = await requireAdmin(request)
        if (denied) return denied

        await connectDB()

        const categoryData = await request.json()

        // Generate slug if not provided
        if (!categoryData.slug && categoryData.name) {
            categoryData.slug = categoryData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
        }

        // Use new + save instead of create for better error handling
        const category = new Category(categoryData)
        await category.save()

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json({
            error: 'Failed to create category',
            message: error.message
        }, { status: 500 })
    }
}

