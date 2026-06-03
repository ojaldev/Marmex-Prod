/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window algorithm with cleanup.
 * NOTE: In a serverless environment, this resets between cold starts.
 * For production scale, migrate to Redis-based rate limiting (e.g., @upstash/ratelimit).
 */

const rateLimitStore = new Map()

function cleanup() {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) {
        // Remove entries older than 1 hour
        if (now - entry.windowStart > 60 * 60 * 1000) {
            rateLimitStore.delete(key)
        }
    }
}

// Run cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000)

/**
 * Check if a request should be rate limited
 * @param {string} identifier - Unique identifier (IP, user ID, etc.)
 * @param {number} maxRequests - Max requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ success: boolean, limit: number, remaining: number, reset: number }}
 */
export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60 * 1000) {
    const now = Date.now()
    const key = `${identifier}:${Math.floor(now / windowMs)}`
    const entry = rateLimitStore.get(key)

    if (!entry) {
        rateLimitStore.set(key, { count: 1, windowStart: now })
        return {
            success: true,
            limit: maxRequests,
            remaining: maxRequests - 1,
            reset: Math.ceil((Math.floor(now / windowMs) + 1) * windowMs / 1000)
        }
    }

    if (entry.count >= maxRequests) {
        return {
            success: false,
            limit: maxRequests,
            remaining: 0,
            reset: Math.ceil((Math.floor(now / windowMs) + 1) * windowMs / 1000)
        }
    }

    entry.count++
    return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - entry.count,
        reset: Math.ceil((Math.floor(now / windowMs) + 1) * windowMs / 1000)
    }
}

/**
 * Get client IP from request
 * @param {Request} request
 * @returns {string}
 */
export function getClientIP(request) {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    return request.headers.get('x-real-ip') || 'unknown'
}
