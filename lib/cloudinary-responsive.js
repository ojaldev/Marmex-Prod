/**
 * Cloudinary Responsive Image Utilities
 *
 * Generates srcset strings with Cloudinary width-based transforms
 * for native <img> elements, and provides URL helpers for Next.js <Image>.
 */

const CLOUDINARY_HOST = 'res.cloudinary.com'

/**
 * Check if a URL is hosted on Cloudinary
 */
export function isCloudinaryUrl(url) {
    return typeof url === 'string' && url.includes(CLOUDINARY_HOST)
}

/**
 * Inject Cloudinary transforms into a URL.
 * Example:
 *   https://res.cloudinary.com/demo/image/upload/v123/cat.jpg
 *   → https://res.cloudinary.com/demo/image/upload/w_640,f_auto,q_auto/v123/cat.jpg
 */
export function getCloudinaryUrl(url, transforms = {}) {
    if (!isCloudinaryUrl(url)) return url

    const transformString = buildTransformString(transforms)
    if (!transformString) return url

    // Insert transforms after /upload/ or /video/upload/
    const uploadPattern = /(\/upload\/)(?:v\d+\/)?/
    const videoUploadPattern = /(\/video\/upload\/)(?:v\d+\/)?/

    if (uploadPattern.test(url)) {
        return url.replace(uploadPattern, `$1${transformString}/`)
    }
    if (videoUploadPattern.test(url)) {
        return url.replace(videoUploadPattern, `$1${transformString}/`)
    }

    return url
}

/**
 * Build a Cloudinary transform string from an object.
 * { w: 640, f: 'auto', q: 'auto' } → 'w_640,f_auto,q_auto'
 */
function buildTransformString(transforms) {
    const parts = []
    if (transforms.w) parts.push(`w_${transforms.w}`)
    if (transforms.h) parts.push(`h_${transforms.h}`)
    if (transforms.c) parts.push(`c_${transforms.c}`)
    if (transforms.f) parts.push(`f_${transforms.f}`)
    if (transforms.q) parts.push(`q_${transforms.q}`)
    if (transforms.ar) parts.push(`ar_${transforms.ar}`)
    return parts.join(',')
}

/**
 * Default responsive widths for srcset generation
 */
const DEFAULT_WIDTHS = [320, 640, 750, 828, 1080, 1200, 1920]

/**
 * Generate a srcset string for a Cloudinary image URL.
 *
 * @param {string} url - Original Cloudinary URL
 * @param {number[]} widths - Array of widths for srcset (default: [320, 640, 750, 828, 1080, 1200, 1920])
 * @param {object} extraTransforms - Additional transforms to apply (e.g. { c: 'limit' })
 * @returns {string} srcset attribute value
 */
export function getCloudinarySrcSet(url, widths = DEFAULT_WIDTHS, extraTransforms = {}) {
    if (!isCloudinaryUrl(url)) return ''

    return widths
        .map(w => {
            const transformed = getCloudinaryUrl(url, { ...extraTransforms, w, f: 'auto', q: 'auto' })
            return `${transformed} ${w}w`
        })
        .join(', ')
}

/**
 * Get the best src URL for a given container width.
 * Useful for Next.js <Image> src when you want direct Cloudinary delivery
 * instead of Next.js image optimization proxy.
 */
export function getCloudinarySrcForWidth(url, width, extraTransforms = {}) {
    if (!isCloudinaryUrl(url)) return url
    return getCloudinaryUrl(url, { ...extraTransforms, w: width, f: 'auto', q: 'auto' })
}
