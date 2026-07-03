import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { auth } from '@/lib/auth'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Please login to upload' }, { status: 401 })
        }

        // Rate limit: 10 uploads per 10 minutes per IP
        const ip = getClientIP(request)
        const rl = checkRateLimit(`review-upload:${ip}`, 10, 10 * 60 * 1000)
        if (!rl.success) {
            return NextResponse.json(
                { error: 'Too many upload attempts. Please try again later.' },
                { status: 429 }
            )
        }

        const { file } = await request.json()

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const result = await uploadImage(file, {
            folder: 'reviews',
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        })

        return NextResponse.json({ url: result.secure_url })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}
