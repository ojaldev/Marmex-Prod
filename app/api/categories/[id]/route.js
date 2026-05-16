import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'

// GET single category
export async function GET(request, { params }) {
    try {
        await connectDB()
        const { id } = await params

        const category = await Category.findById(id)

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        return NextResponse.json(category)
    } catch (error) {
        console.error('Error fetching category:', error)
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
    }
}

// UPDATE category
export async function PUT(request, { params }) {
    try {
        await connectDB()
        const { id } = await params
        const updates = await request.json()

        const category = await Category.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        return NextResponse.json(category)
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json({
            error: 'Failed to update category',
            message: error.message
        }, { status: 500 })
    }
}

// DELETE category
export async function DELETE(request, { params }) {
    try {
        await connectDB()
        const { id } = await params

        const category = await Category.findByIdAndDelete(id)

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        // Clean up images from Cloudinary
        const { deleteImageFromUrl } = await import('@/lib/cloudinary');
        if (category.image) {
            deleteImageFromUrl(category.image).catch(err => console.error('Failed to delete category image:', err));
        }
        if (category.icon) {
            deleteImageFromUrl(category.icon).catch(err => console.error('Failed to delete category icon:', err));
        }

        return NextResponse.json({ message: 'Category deleted successfully' })
    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
