import mongoose from 'mongoose'

// Delete the model if it exists to ensure fresh schema
if (mongoose.models.Category) {
    delete mongoose.models.Category
}

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    parentCategory: {
        type: String,
        trim: true,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Indexes
categorySchema.index({ active: 1, order: 1 })

// Export model
const Category = mongoose.model('Category', categorySchema)
export default Category
