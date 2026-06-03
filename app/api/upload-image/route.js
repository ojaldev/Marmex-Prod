import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { isAdmin } from '@/lib/admin-auth'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(request) {
    try {
        // Rate limit: 10 uploads per 10 minutes per IP
        const ip = getClientIP(request)
        const rateLimit = checkRateLimit(`upload:${ip}`, 10, 10 * 60 * 1000)
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many upload attempts. Please try again later.' },
                { status: 429 }
            )
        }

        // Check admin authentication (NextAuth session or JWT-signed cookie)
        const admin = await isAdmin(request)
        if (!admin) {
            console.log('Upload unauthorized: No valid admin session or cookie')
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
