import { NextResponse } from 'next/server'

export function middleware(request) {
    // Check if the request is for an admin route (excluding login)
    if (request.nextUrl.pathname.startsWith('/admin') &&
        !request.nextUrl.pathname.startsWith('/admin/login')) {

        // Check for authentication cookie
        const authCookie = request.cookies.get('admin-auth')

        if (!authCookie || authCookie.value !== 'authenticated') {
            // Redirect to login page if not authenticated
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*'
}
