import mongoose from 'mongoose'

const ticketMessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    senderName: String,
    message: {
        type: String,
        required: true
    },
    attachments: [String], // Cloudinary URLs
    timestamp: {
        type: Date,
        default: Date.now
    }
})

const ticketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },

    subject: {
        type: String,
        required: true
    },

    category: {
        type: String,
        enum: ['order', 'product', 'payment', 'return', 'delivery', 'general'],
        required: true
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    status: {
        type: String,
        enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'],
        default: 'open'
    },

    messages: [ticketMessageSchema],

    assignedTo: {
        type: String
    },

    tags: [String],

    resolvedAt: Date,
    closedAt: Date,

    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: String
}, {
    timestamps: true
})

// Add ticket number
ticketSchema.pre('save', async function (next) {
    if (!this.ticketNumber) {
        const count = await mongoose.model('Ticket').countDocuments()
        this.ticketNumber = `TKT${Date.now()}${String(count + 1).padStart(4, '0')}`
    }
    next()
})

// Indexes for faster queries
ticketSchema.index({ user: 1, status: 1 })
ticketSchema.index({ category: 1, status: 1 })
ticketSchema.index({ assignedTo: 1, status: 1 })

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema)

export default Ticket
