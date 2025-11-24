import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { z } from 'zod'

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    mobile: z.string().optional()
})

export async function POST(request) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = registerSchema.parse(body)

        await connectDB()

        // Check if user already exists
        const existingUser = await User.findOne({
            email: validatedData.email.toLowerCase()
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Create new user
        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email.toLowerCase(),
            password: validatedData.password,
            mobile: validatedData.mobile
        })

        // Remove password from response
        const userResponse = user.toJSON()

        return NextResponse.json({
            message: 'Registration successful',
            user: userResponse
        }, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        )
    }
}
