import { NextResponse } from 'next/server'

const ADMIN_PASSWORD = 'Marmex@OmShanti'

export async function POST(request) {
    try {
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
