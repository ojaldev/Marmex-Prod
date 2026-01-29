import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request) {
    try {
        // Check for NextAuth session OR admin cookie
        const session = await auth()
        const cookieStore = await cookies()
        const adminAuth = cookieStore.get('admin-auth')

        const isAuthenticated = session || (adminAuth && adminAuth.value === 'authenticated')

        if (!isAuthenticated) {
            console.log('Upload unauthorized: No session and no admin cookie')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { image, folder } = body

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        // Upload to Cloudinary
        const result = await uploadImage(image, folder || 'marmex/products')

        return NextResponse.json({
            url: result.url,
            publicId: result.publicId
        })

    } catch (error) {
        console.error('Image upload error:', error)
        return NextResponse.json({
            error: 'Failed to upload image',
            message: error.message
        }, { status: 500 })
    }
}

