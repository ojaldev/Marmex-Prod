import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
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
    images: [{
        type: String
    }],
    thumbnailImage: {
        type: String,
        required: [true, 'Thumbnail image is required']
    },
    completionDate: {
        type: Date
    },
    location: {
        type: String,
        trim: true
    },
    materials: [{
        type: String,
        trim: true
    }],
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
    }]
}, {
    timestamps: true
})

// Indexes for query performance
projectSchema.index({ title: 'text', description: 'text', tags: 'text' })
projectSchema.index({ category: 1 })
projectSchema.index({ featured: 1, createdAt: -1 })
projectSchema.index({ completionDate: -1 })

// Export model
export default mongoose.models.Project || mongoose.model('Project', projectSchema)
