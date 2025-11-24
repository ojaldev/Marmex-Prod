import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        index: true
    },
    shortDescription: {
        type: String,
        trim: true
    },
    detailedDescription: {
        type: String,
        trim: true
    },
    material: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        trim: true
    },
    dimensions: {
        type: String,
        trim: true
    },
    weight: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    stock: {
        type: String,
        enum: ['In Stock', 'Made to Order', 'Out of Stock'],
        default: 'In Stock'
    },
    customizationAvailable: {
        type: Boolean,
        default: false
    },
    customizationInstructions: {
        type: String,
        trim: true
    },
    mainImage: {
        type: String,
        required: [true, 'Main image is required']
    },
    additionalImages: [{
        type: String
    }],
    lifestyleImages: [{
        type: String
    }],
    packagingImages: [{
        type: String
    }],
    videoThumbnail: {
        type: String
    },
    videoUrl: {
        type: String
    },
    instagramReel: {
        type: String
    },
    metaTitle: {
        type: String,
        trim: true
    },
    metaDescription: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    highlight: {
        type: String,
        enum: ['', 'New Arrival', 'Featured', 'Bestseller', 'Limited Edition'],
        default: ''
    },
    giftReady: {
        type: Boolean,
        default: false
    },
    exportGrade: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
})

// Indexes for better query performance
productSchema.index({ name: 'text', shortDescription: 'text', tags: 'text' })
productSchema.index({ category: 1, price: 1 })
productSchema.index({ stock: 1 })
productSchema.index({ highlight: 1 })
productSchema.index({ createdAt: -1 })

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function () {
    if (this.discount > 0) {
        return this.price - (this.price * this.discount / 100)
    }
    return this.price
})

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true })
productSchema.set('toObject', { virtuals: true })

// Export model (handling hot reload in development)
export default mongoose.models.Product || mongoose.model('Product', productSchema)
