import mongoose from 'mongoose'

const customOrderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['sculpture', 'gift', 'decor', 'award', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    budget: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['new', 'reviewing', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled'],
        default: 'new'
    },
    ipAddress: {
        type: String
    }
}, {
    timestamps: true
})

customOrderSchema.index({ status: 1, createdAt: -1 })
customOrderSchema.index({ email: 1 })

const CustomOrder = mongoose.models.CustomOrder || mongoose.model('CustomOrder', customOrderSchema)

export default CustomOrder
