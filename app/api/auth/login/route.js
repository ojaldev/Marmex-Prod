import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

const ADMIN_PASSWORD = 'Marmex@OmShanti'

export async function POST(request) {
    try {
        // Rate limit: 5 login attempts per 15 minutes per IP
        const ip = getClientIP(request)
        const rateLimit = checkRateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rateLimit.reset) } }
            )
        }

        const { password } = await request.json()

        if (password === ADMIN_PASSWORD) {
            const response = NextResponse.json({ success: true })

            // Set a secure cookie for authentication
            response.cookies.set('admin-auth', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })

            return response
        }

        return NextResponse.json(
            { error: 'Invalid password. Please try again.' },
            { status: 401 }
        )
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        )
    }
}
