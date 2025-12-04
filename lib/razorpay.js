import Razorpay from 'razorpay'

// Lazy initialization to avoid build-time errors
let razorpayInstance = null

function getRazorpayInstance() {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials are not configured')
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
    }
    return razorpayInstance
}

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(amount, receiptId, notes = {}) {
    try {
        const razorpay = getRazorpayInstance()
        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: 'INR',
            receipt: receiptId,
            notes
        }

        const order = await razorpay.orders.create(options)
        return order
    } catch (error) {
        console.error('Razorpay order creation error:', error)
        throw new Error('Failed to create payment order')
    }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(orderId, paymentId, signature) {
    const crypto = require('crypto')

    if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay key secret is not configured')
    }

    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex')

    return generatedSignature === signature
}

/**
 * Fetch payment details
 */
export async function getPaymentDetails(paymentId) {
    try {
        const razorpay = getRazorpayInstance()
        const payment = await razorpay.payments.fetch(paymentId)
        return payment
    } catch (error) {
        console.error('Fetch payment error:', error)
        throw new Error('Failed to fetch payment details')
    }
}

/**
 * Initiate refund
 */
export async function initiateRefund(paymentId, amount, notes = {}) {
    try {
        const razorpay = getRazorpayInstance()
        const refund = await razorpay.payments.refund(paymentId, {
            amount: Math.round(amount * 100), // Amount in paise
            notes
        })
        return refund
    } catch (error) {
        console.error('Refund initiation error:', error)
        throw new Error('Failed to initiate refund')
    }
}

// Export getter for cases where direct instance access is needed
export function getRazorpay() {
    return getRazorpayInstance()
}
