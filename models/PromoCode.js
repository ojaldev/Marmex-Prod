import mongoose from 'mongoose'

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    active: {
        type: Boolean,
        default: true
    },
    description: String
}, {
    timestamps: true
})

// Validate promo code
promoCodeSchema.methods.isValid = function (userId, orderTotal) {
    const now = new Date()

    // Check if active
    if (!this.active) return { valid: false, message: 'Promo code is no longer active' }

    // Check date range
    if (now < this.validFrom) return { valid: false, message: 'Promo code is not yet valid' }
    if (now > this.validUntil) return { valid: false, message: 'Promo code has expired' }

    // Check minimum order value
    if (orderTotal < this.minOrderValue) {
        return { valid: false, message: `Minimum order value of ₹${this.minOrderValue} required` }
    }

    // Check usage limit
    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        return { valid: false, message: 'Promo code usage limit reached' }
    }

    // Check if user already used it
    if (userId && this.usedBy.includes(userId)) {
        return { valid: false, message: 'You have already used this promo code' }
    }

    return { valid: true }
}

// Calculate discount
promoCodeSchema.methods.calculateDiscount = function (orderTotal) {
    let discount = 0

    if (this.type === 'percentage') {
        discount = (orderTotal * this.value) / 100
        if (this.maxDiscount) {
            discount = Math.min(discount, this.maxDiscount)
        }
    } else {
        discount = this.value
    }

    return Math.min(discount, orderTotal)
}

const PromoCode = mongoose.models.PromoCode || mongoose.model('PromoCode', promoCodeSchema)

export default PromoCode
