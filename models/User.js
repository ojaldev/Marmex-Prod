import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const addressSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
})

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    mobile: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: function () {
            return !this.oauth?.google && !this.oauth?.apple
        }
    },
    name: {
        type: String,
        required: true
    },
    photo: String,
    addresses: [addressSchema],
    wishlist: [{
        type: String, // Product IDs (keeping as string for now since products are in JSON)
    }],
    oauth: {
        google: String,
        apple: String
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    mobileVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
})

// Hash password before saving - FIXED for Mongoose 6+
userSchema.pre('save', async function () {
    // Only hash password if it's modified or new
    if (!this.isModified('password') || !this.password) {
        return
    }

    try {
        const salt = await bcrypt.genSalt(12)
        this.password = await bcrypt.hash(this.password, salt)
    } catch (error) {
        throw error
    }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false
    return bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject()
    delete obj.password
    delete obj.resetPasswordToken
    delete obj.resetPasswordExpires
    return obj
}

export default mongoose.models.User || mongoose.model('User', userSchema)
