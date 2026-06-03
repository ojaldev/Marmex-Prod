import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import crypto from 'crypto'

export async function POST(request) {
    try {
        // Rate limit: 3 forgot password attempts per hour per IP
        const ip = getClientIP(request)
        const rateLimit = checkRateLimit(`forgot-password:${ip}`, 3, 60 * 60 * 1000)
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many password reset attempts. Please try again later.' },
                { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rateLimit.reset) } }
            )
        }

        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        await connectDB()

        const user = await User.findOne({ email: email.toLowerCase() })

        // Always return success even if user not found (security best practice)
        if (!user) {
            return NextResponse.json({
                message: 'If an account exists with that email, a password reset link has been sent.'
            })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')

        // Save hashed token and expiry to user
        user.resetPasswordToken = resetTokenHash
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
        await user.save()

        // Send email
        try {
            await sendPasswordResetEmail(user.email, resetToken)
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError)
            // Clear the reset token if email fails
            user.resetPasswordToken = undefined
            user.resetPasswordExpires = undefined
            await user.save()

            return NextResponse.json(
                { error: 'Failed to send reset email. Please try again.' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: 'If an account exists with that email, a password reset link has been sent.'
        })

    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json(
            { error: 'An error occurred. Please try again.' },
            { status: 500 }
        )
    }
}
