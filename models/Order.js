import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: String
})

const addressSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
})

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    guestEmail: String,

    items: [orderItemSchema],

    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    shippingAddress: { type: addressSchema, required: true },
    billingAddress: addressSchema,

    payment: {
        method: {
            type: String,
            enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        gateway: { type: String, default: 'razorpay' },
        paidAt: Date,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String
    },

    promoCode: String,

    deliveryDate: Date,

    shippingMethod: {
        id: String,
        name: String,
        cost: Number,
        description: String
    },

    giftOptions: {
        isGift: { type: Boolean, default: false },
        message: String,
        cost: { type: Number, default: 0 }
    },

    gstInvoice: {
        needed: { type: Boolean, default: false },
        companyName: String,
        gstin: String,
        companyAddress: String
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },

    timeline: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
    }],

    tracking: {
        carrier: String,
        trackingNumber: String,
        estimatedDelivery: Date,
        currentLocation: String,
        events: [{
            status: String,
            location: String,
            timestamp: Date,
            description: String
        }]
    },

    invoice: {
        number: String,
        gstNumber: String,
        url: String
    },

    refund: {
        status: { type: String, enum: ['none', 'pending', 'processing', 'completed', 'failed'], default: 'none' },
        amount: Number,
        initiatedAt: Date,
        completedAt: Date,
        refundId: String,
        method: String
    },

    notes: String,

    cancelledAt: Date,
    cancelReason: String
}, {
    timestamps: true
})

// Generate unique order number
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments()
        this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(4, '0')}`
    }
    next()
})

export default mongoose.models.Order || mongoose.model('Order', orderSchema)
