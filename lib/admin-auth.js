import { cookies } from 'next/headers'
import { auth } from './auth'

/**
 * Unified admin authentication check.
 * Supports both NextAuth session (role === 'admin') and legacy admin-auth cookie.
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

    // 2. Fall back to admin-auth cookie (legacy CMS auth)
    try {
        const cookieStore = await cookies()
        const adminCookie = cookieStore.get('admin-auth')
        if (adminCookie?.value === 'authenticated') {
            return true
        }
    } catch {
        // cookies() not available (e.g. in non-Request context), fall through
    }

    // 3. Also check request headers for the cookie (for edge/runtime contexts)
    if (request?.headers?.get('cookie')) {
        const cookieHeader = request.headers.get('cookie')
        if (cookieHeader.includes('admin-auth=authenticated')) {
            return true
        }
    }

    return false
}
