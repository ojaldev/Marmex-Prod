import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request) {
    try {
        // Check if user is authenticated
        const session = await auth()

        if (!session) {
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
