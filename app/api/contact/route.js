import { NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import Contact from '@/models/Contact'
import { sendContactEmail, sendContactConfirmationEmail } from '@/lib/email'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().max(20, 'Phone number is too long').optional().or(z.literal('')),
    subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject is too long'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message is too long')
})

export async function POST(request) {
    try {
        // Rate limit: 3 submissions per 15 minutes per IP
        const ip = getClientIP(request)
        const rateLimit = checkRateLimit(`contact:${ip}`, 3, 15 * 60 * 1000)
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many submissions. Please try again later.' },
                { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rateLimit.reset) } }
            )
        }

        const body = await request.json()

        // Validate input
        const result = contactSchema.safeParse(body)
        if (!result.success) {
            const errors = result.error.errors.map(e => ({ field: e.path[0], message: e.message }))
            return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
        }

        const { name, email, phone, subject, message } = result.data

        // Connect to DB and save submission
        await dbConnect()
        const contact = await Contact.create({
            name,
            email,
            phone: phone || undefined,
            subject,
            message,
            ipAddress: ip
        })

        // Send notification to admin
        await sendContactEmail({ name, email, phone, subject, message })

        // Send confirmation to user
        await sendContactConfirmationEmail(email, name)

        return NextResponse.json(
            { success: true, message: 'Your message has been sent successfully.', id: contact._id },
            { status: 200 }
        )
    } catch (error) {
        console.error('Contact form error:', error)
        return NextResponse.json(
            { error: 'Something went wrong. Please try again later.' },
            { status: 500 }
        )
    }
}
