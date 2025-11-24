import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'

export async function POST(request) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // Hash the token to compare with stored hash
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        await connectDB()

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 400 }
            )
        }

        // Update password
        user.password = password
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        return NextResponse.json({
            message: 'Password reset successful. You can now login with your new password.'
        })

    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json(
            { error: 'Failed to reset password. Please try again.' },
            { status: 500 }
        )
    }
}
