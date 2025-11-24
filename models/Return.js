import mongoose from 'mongoose'

const returnItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: String,
    quantity: { type: Number, required: true, min: 1 },
    reason: {
        type: String,
        enum: ['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'other'],
        required: true
    },
    reasonDetails: String
})

const returnSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [returnItemSchema],

    type: {
        type: String,
        enum: ['return', 'exchange'],
        required: true
    },

    reason: {
        type: String,
        required: true
    },

    comments: String,

    images: [String], // Cloudinary URLs

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'picked_up', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },

    pickupScheduled: Date,
    pickupAddress: {
        name: String,
        phone: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String
    },

    refundAmount: Number,
    refundStatus: {
        type: String,
        enum: ['none', 'pending', 'processing', 'completed', 'failed'],
        default: 'none'
    },
    refundId: String,

    timeline: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: String
    }],

    adminNotes: String,
    resolutionDate: Date
}, {
    timestamps: true
})

// Add initial timeline entry
returnSchema.pre('save', function (next) {
    if (this.isNew) {
        this.timeline.push({
            status: 'pending',
            timestamp: new Date(),
            note: 'Return request submitted'
        })
    }
    next()
})

const Return = mongoose.models.Return || mongoose.model('Return', returnSchema)

export default Return
