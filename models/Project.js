import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true
    },
    client: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    longDescription: {
        type: String,
        trim: true
    },
    beforeImage: {
        type: String
    },
    afterImage: {
        type: String
    },
    installationVideo: {
        type: String
    },
    clientTestimonial: {
        type: String,
        trim: true
    },
    testimonialVideo: {
        type: String
    },
    completionDate: {
        type: Date
    },
    location: {
        type: String,
        trim: true
    },
    materials: {
        type: String,
        trim: true
    },
    dimensions: {
        type: String,
        trim: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    projectType: {
        type: String,
        enum: ['residential', 'commercial'],
        default: 'residential'
    },
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, {
    timestamps: true
})

// Indexes for query performance
projectSchema.index({ name: 'text', description: 'text', tags: 'text' })
projectSchema.index({ category: 1 })
projectSchema.index({ featured: 1, createdAt: -1 })
projectSchema.index({ completionDate: -1 })
projectSchema.index({ projectType: 1, featured: -1, completionDate: -1 })
projectSchema.index({ relatedProducts: 1 })

// Export model
export default mongoose.models.Project || mongoose.model('Project', projectSchema)
