import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'X-DNS-Prefetch-Control': 'on',
}

async function verifyAdminCookie(token) {
    try {
        const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 })
        return payload.admin === true
    } catch {
        return false
    }
}

export async function middleware(request) {
    const response = NextResponse.next()

    // Apply security headers to all responses
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
    })

    // Check if the request is for an admin route (excluding login)
    if (request.nextUrl.pathname.startsWith('/admin') &&
        !request.nextUrl.pathname.startsWith('/admin/login')) {

        const authCookie = request.cookies.get('admin-auth')

        if (!authCookie?.value || !(await verifyAdminCookie(authCookie.value))) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: '/admin/:path*'
}
