import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const addressId = params.id

        await connectDB()

        const user = await User.findById(session.user.id)

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const address = user.addresses.id(addressId)

        if (!address) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 })
        }

        // If setting as default, remove default from others
        if (body.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false)
        }

        // Update address
        Object.assign(address, body)
        await user.save()

        return NextResponse.json({
            message: 'Address updated successfully',
            address
        })

    } catch (error) {
        console.error('Update address error:', error)
        return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const addressId = params.id

        await connectDB()

        const user = await User.findById(session.user.id)

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        user.addresses.pull(addressId)
        await user.save()

        return NextResponse.json({ message: 'Address deleted successfully' })

    } catch (error) {
        console.error('Delete address error:', error)
        return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
    }
}
