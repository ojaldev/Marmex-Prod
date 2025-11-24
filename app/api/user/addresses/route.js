import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()

        const user = await User.findById(session.user.id).select('addresses')

        return NextResponse.json({ addresses: user?.addresses || [] })

    } catch (error) {
        console.error('Get addresses error:', error)
        return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        await connectDB()

        const user = await User.findById(session.user.id)

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // If this is the first address or marked as default, set it as default
        if (user.addresses.length === 0 || body.isDefault) {
            // Remove default from other addresses
            user.addresses.forEach(addr => addr.isDefault = false)
        }

        user.addresses.push(body)
        await user.save()

        return NextResponse.json({
            message: 'Address added successfully',
            address: user.addresses[user.addresses.length - 1]
        })

    } catch (error) {
        console.error('Add address error:', error)
        return NextResponse.json({ error: 'Failed to add address' }, { status: 500 })
    }
}
