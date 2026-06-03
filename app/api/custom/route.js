import { NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import CustomOrder from '@/models/CustomOrder'
import { sendCustomOrderEmail, sendCustomOrderConfirmationEmail } from '@/lib/email'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

const customOrderSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(7, 'Phone number is too short').max(20),
    category: z.enum(['sculpture', 'gift', 'decor', 'award', 'other'], {
        errorMap: () => ({ message: 'Please select a category' })
    }),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    budget: z.string().max(50).optional().or(z.literal(''))
})

export async function POST(request) {
    try {
        // Rate limit: 3 submissions per 15 minutes per IP
        const ip = getClientIP(request)
        const rateLimit = checkRateLimit(`custom-order:${ip}`, 3, 15 * 60 * 1000)
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many submissions. Please try again later.' },
                { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rateLimit.reset) } }
            )
        }

        const body = await request.json()

        // Validate input
        const result = customOrderSchema.safeParse(body)
        if (!result.success) {
            const errors = result.error.errors.map(e => ({ field: e.path[0], message: e.message }))
            return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
        }

        const { name, email, phone, category, description, budget } = result.data

        // Connect to DB and save submission
        await dbConnect()
        const customOrder = await CustomOrder.create({
            name,
            email,
            phone,
            category,
            description,
            budget: budget || undefined,
            ipAddress: ip
        })

        // Send notification to admin
        await sendCustomOrderEmail({ name, email, phone, category, description, budget })

        // Send confirmation to user
        await sendCustomOrderConfirmationEmail(email, name)

        return NextResponse.json(
            { success: true, message: 'Your custom order inquiry has been submitted successfully.', id: customOrder._id },
            { status: 200 }
        )
    } catch (error) {
        console.error('Custom order form error:', error)
        return NextResponse.json(
            { error: 'Something went wrong. Please try again later.' },
            { status: 500 }
        )
    }
}
