import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from './auth'
import { verifyAdminToken } from './admin-jwt'

/**
 * Unified admin authentication check.
 * Supports both NextAuth session (role === 'admin') and JWT-signed admin-auth cookie.
 *
 * Usage in API routes:
 *   const admin = await isAdmin(request)
 *   if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
 */
export async function isAdmin(request) {
    // 1. Try NextAuth session first
    try {
        const session = await auth()
        if (session?.user?.role === 'admin') {
            return true
        }
    } catch {
        // NextAuth not available, fall through
    }

    // 2. Fall back to JWT-signed admin-auth cookie
    try {
        const cookieStore = await cookies()
        const adminCookie = cookieStore.get('admin-auth')
        if (adminCookie?.value && await verifyAdminToken(adminCookie.value)) {
            return true
        }
    } catch {
        // cookies() not available, fall through
    }

    // 3. Also check request headers for the cookie (for edge/runtime contexts)
    if (request?.headers?.get('cookie')) {
        const cookieHeader = request.headers.get('cookie')
        const match = cookieHeader.match(/admin-auth=([^;]+)/)
        if (match?.[1] && await verifyAdminToken(match[1])) {
            return true
        }
    }

    return false
}

/**
 * Guard for admin-only route handlers.
 * Returns a 403 NextResponse if the caller is not an admin, otherwise null.
 *
 * Usage:
 *   const denied = await requireAdmin(request)
 *   if (denied) return denied
 */
export async function requireAdmin(request) {
    const ok = await isAdmin(request)
    if (!ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return null
}
