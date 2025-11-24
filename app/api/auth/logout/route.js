import { NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json({ success: true })

    // Clear the authentication cookie
    response.cookies.delete('admin-auth')

    return response
}
