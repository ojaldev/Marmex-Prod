import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { uploadImage } from '@/lib/cloudinary'

export async function GET(request) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()

        const user = await User.findById(session.user.id).select('-password')

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ user })

    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        console.log('🔄 Profile Update: Starting...')
        const session = await auth()

        if (!session) {
            console.log('❌ Profile Update: Unauthorized - no session')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('✅ Profile Update: Session found for user:', session.user.email)

        const body = await request.json()
        const { name, mobile, photo } = body

        console.log('📝 Profile Update: Received data:', {
            name,
            mobile: mobile ? 'provided' : 'not provided',
            photo: photo ? `${photo.substring(0, 30)}...` : 'not provided'
        })

        await connectDB()

        const user = await User.findById(session.user.id)

        if (!user) {
            console.log('❌ Profile Update: User not found in database')
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        console.log('✅ Profile Update: User found in DB:', user.email)

        // Update fields
        if (name) {
            console.log('📝 Updating name:', name)
            user.name = name
        }
        if (mobile !== undefined) {
            console.log('📝 Updating mobile:', mobile)
            user.mobile = mobile
        }

        // Handle photo upload if provided (base64 string)
        if (photo && photo.startsWith('data:image')) {
            console.log('📷 Profile Update: Photo provided, uploading to Cloudinary...')
            const uploadResult = await uploadImage(photo, 'marmex/profiles')
            console.log('✅ Profile Update: Cloudinary upload successful, URL:', uploadResult.url)
            user.photo = uploadResult.url
            console.log('✅ Profile Update: Photo URL set in user object')
        }

        console.log('💾 Profile Update: Saving user to database...')
        await user.save()
        console.log('✅ Profile Update: User saved successfully!')

        const updatedUser = user.toJSON()
        console.log('📤 Profile Update: Returning updated user with photo:', updatedUser.photo)

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUser
        })

    } catch (error) {
        console.error('❌ Update user error:', error)
        return NextResponse.json({
            error: 'Failed to update profile',
            message: error.message
        }, { status: 500 })
    }
}
