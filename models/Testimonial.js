import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    role: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Testimonial content is required'],
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },
    image: {
        type: String
    },
    featured: {
        type: Boolean,
        default: false,
        index: true
    },
    projectReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }
}, {
    timestamps: true
})

// Indexes
testimonialSchema.index({ featured: 1, createdAt: -1 })
testimonialSchema.index({ rating: -1 })

// Export model
export default mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema)
