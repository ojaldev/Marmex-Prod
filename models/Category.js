import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    icon: {
        type: String
    },
    parentCategory: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
})

// Indexes
categorySchema.index({ slug: 1 })
categorySchema.index({ active: 1, order: 1 })
categorySchema.index({ parentCategory: 1 })

// Virtual for product count (will be populated via aggregation)
categorySchema.virtual('productCount', {
    ref: 'Product',
    localField: 'name',
    foreignField: 'category',
    count: true
})

// Auto-generate slug from name
categorySchema.pre('save', function (next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }
    next()
})

// Ensure virtuals are included
categorySchema.set('toJSON', { virtuals: true })
categorySchema.set('toObject', { virtuals: true })

// Export model
export default mongoose.models.Category || mongoose.model('Category', categorySchema)
