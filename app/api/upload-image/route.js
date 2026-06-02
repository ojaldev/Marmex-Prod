import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
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
        const { image, file, folder, type } = body

        const fileData = image || file
        if (!fileData) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const isVideo = type === 'video'

        // Upload to Cloudinary
        const result = await uploadImage(fileData, {
            folder: folder || (isVideo ? 'marmex/products/videos' : 'marmex/products'),
            transformation: isVideo ? undefined : [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto:good' }
            ],
            resource_type: isVideo ? 'video' : 'image'
        })

        return NextResponse.json({
            url: result.url,
            secure_url: result.secure_url,
            publicId: result.publicId
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({
            error: 'Failed to upload file',
            message: error.message
        }, { status: 500 })
    }
}
