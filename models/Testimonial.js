import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    reviewText: {
        type: String,
        required: [true, 'Review content is required'],
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },
    imageUrl: {
        type: String
    },
    videoUrl: {
        type: String
    },
    productReference: {
        type: String,
        trim: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
})

testimonialSchema.index({ featured: 1, createdAt: -1 })
testimonialSchema.index({ rating: -1 })

export default mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema)
