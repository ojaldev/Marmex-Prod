import mongoose from 'mongoose'

// Single-document collection — key is always 'default'.
const siteConfigSchema = new mongoose.Schema({
    key: { type: String, default: 'default', unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true, minimize: false })

export default mongoose.models.SiteConfig || mongoose.model('SiteConfig', siteConfigSchema)
