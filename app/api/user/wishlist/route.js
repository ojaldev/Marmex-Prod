import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// Get user's wishlist
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()

        const user = await User.findById(session.user.id).select('wishlist')

        return NextResponse.json({ wishlist: user?.wishlist || [] })

    } catch (error) {
        console.error('Get wishlist error:', error)
        return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
    }
}

// Add item to wishlist
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { productId } = await request.json()

        await connectDB()

        const user = await User.findById(session.user.id)

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if already in wishlist
        if (user.wishlist.includes(productId)) {
            return NextResponse.json({ message: 'Already in wishlist' })
        }

        user.wishlist.push(productId)
        await user.save()

        return NextResponse.json({
            message: 'Added to wishlist',
            wishlist: user.wishlist
        })

    } catch (error) {
        console.error('Add to wishlist error:', error)
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
    }
}

// Remove item from wishlist
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        await connectDB()

        const user = await User.findById(session.user.id)

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        user.wishlist = user.wishlist.filter(id => id !== productId)
        await user.save()

        return NextResponse.json({
            message: 'Removed from wishlist',
            wishlist: user.wishlist
        })

    } catch (error) {
        console.error('Remove from wishlist error:', error)
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
    }
}
