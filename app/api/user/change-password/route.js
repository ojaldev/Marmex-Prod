import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Please provide both current and new password' },
                { status: 400 }
            )
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'New password must be at least 8 characters' },
                { status: 400 }
            )
        }

        await connectDB()

        const user = await User.findById(session.user.id)

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Verify current password
        const isValid = await user.comparePassword(currentPassword)

        if (!isValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }

        // Update password
        user.password = newPassword
        await user.save()

        return NextResponse.json({ message: 'Password updated successfully' })

    } catch (error) {
        console.error('Change password error:', error)
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
    }
}
