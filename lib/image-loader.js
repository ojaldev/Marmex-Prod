/**
 * Next.js Custom Image Loader for Cloudinary
 *
 * For Cloudinary URLs: generates direct CDN URLs with width, format, and quality
 * transforms instead of proxying through Next.js `/_next/image`.
 *
 * For other URLs: falls back to the default Next.js proxy behavior.
 */

const CLOUDINARY_HOST = 'res.cloudinary.com'

export default function imageLoader({ src, width, quality }) {
    // Local/static images — serve directly, no proxy needed
    if (!src || src.startsWith('/')) {
        return src
    }

    // Non-Cloudinary remote images — fall back to Next.js proxy
    if (!src.includes(CLOUDINARY_HOST)) {
        const params = new URLSearchParams()
        params.set('url', src)
        params.set('w', String(width))
        params.set('q', String(quality || 75))
        return `/_next/image?${params.toString()}`
    }

    // Parse Cloudinary URL and inject transforms
    const transforms = buildTransformString({
        w: width,
        f: 'auto',
        q: quality || 'auto:good',
    })

    // Insert transforms after /upload/ or /video/upload/
    const uploadPattern = /(\/upload\/)(?:v\d+\/)?/
    const videoUploadPattern = /(\/video\/upload\/)(?:v\d+\/)?/

    if (uploadPattern.test(src)) {
        return src.replace(uploadPattern, `$1${transforms}/`)
    }
    if (videoUploadPattern.test(src)) {
        return src.replace(videoUploadPattern, `$1${transforms}/`)
    }

    return src
}

function buildTransformString(transforms) {
    const parts = []
    if (transforms.w) parts.push(`w_${transforms.w}`)
    if (transforms.h) parts.push(`h_${transforms.h}`)
    if (transforms.c) parts.push(`c_${transforms.c}`)
    if (transforms.f) parts.push(`f_${transforms.f}`)
    if (transforms.q) parts.push(`q_${transforms.q}`)
    return parts.join(',')
}
