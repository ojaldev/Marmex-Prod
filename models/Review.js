import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
    product: {
        type: String, // Product ID (string since products are in JSON for now)
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    media: [{
        type: String, // Cloudinary URLs
        url: String
    }],
    verified: {
        type: Boolean,
        default: false // True if user purchased the product
    },
    helpful: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
})

// Index for efficient queries
reviewSchema.index({ product: 1, status: 1, createdAt: -1 })
reviewSchema.index({ user: 1 })

export default mongoose.models.Review || mongoose.model('Review', reviewSchema)
