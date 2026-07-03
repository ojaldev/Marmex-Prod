import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { requireAdmin } from '@/lib/admin-auth'

// Seed categories data with images
const categoriesData = [
    {
        name: "Stone Sculptures",
        slug: "stone-sculptures",
        description: "Exquisite handcrafted stone sculptures",
        image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&h=400&fit=crop",
        order: 1,
        active: true
    },
    {
        name: "Stone Carvings",
        slug: "stone-carvings",
        description: "Intricate jali work, fireplaces, and wall décor",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
        order: 2,
        active: true
    },
    {
        name: "Dining Décor",
        slug: "dining-decor",
        description: "Elegant marble dining accessories",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
        order: 3,
        active: true
    },
    {
        name: "Wall Art",
        slug: "wall-art",
        description: "Premium marble wall decorations",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=400&fit=crop",
        order: 4,
        active: true
    },
    {
        name: "Personalized Gifts",
        slug: "personalized-gifts",
        description: "Custom name plates and special items",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=400&fit=crop",
        order: 5,
        active: true
    },
    {
        name: "Marble Games",
        slug: "marble-games",
        description: "Chess sets, tic-tac-toe, and board games",
        image: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=600&h=400&fit=crop",
        order: 6,
        active: true
    }
]

export async function POST(request) {
    try {
        const denied = await requireAdmin(request)
        if (denied) return denied

        await connectDB()

        // Check if categories already exist
        const existingCount = await Category.countDocuments()

        if (existingCount > 0) {
            return NextResponse.json({
                message: 'Categories already seeded',
                count: existingCount
            })
        }

        // Seed categories
        const created = await Category.insertMany(categoriesData)

        return NextResponse.json({
            message: 'Categories seeded successfully',
            count: created.length,
            categories: created
        }, { status: 201 })

    } catch (error) {
        console.error('Error seeding categories:', error)
        return NextResponse.json({
            error: 'Failed to seed categories',
            message: error.message
        }, { status: 500 })
    }
}

// PUT handler to update existing categories with images
export async function PUT(request) {
    try {
        const denied = await requireAdmin(request)
        if (denied) return denied

        await connectDB()

        // Update each category with its image
        const updates = await Promise.all(
            categoriesData.map(cat =>
                Category.findOneAndUpdate(
                    { slug: cat.slug },
                    { image: cat.image },
                    { new: true }
                )
            )
        )

        const updatedCount = updates.filter(Boolean).length

        return NextResponse.json({
            message: 'Categories updated with images',
            count: updatedCount
        })

    } catch (error) {
        console.error('Error updating categories:', error)
        return NextResponse.json({
            error: 'Failed to update categories',
            message: error.message
        }, { status: 500 })
    }
}
