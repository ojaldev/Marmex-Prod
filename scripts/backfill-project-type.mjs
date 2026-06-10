/**
 * One-time backfill: set projectType on all existing Project documents.
 * Run with: node --env-file=.env.local scripts/backfill-project-type.mjs
 * Delete this file after running and verifying.
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
    console.error('MONGODB_URI not set. Run with --env-file=.env.local')
    process.exit(1)
}

await mongoose.connect(MONGODB_URI)

const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }))

const commercialPatterns = [/commercial/i, /office/i, /hotel/i, /restaurant/i, /retail/i, /hospitality/i, /public/i]

// Set commercial where category name matches
const commercialResult = await Project.updateMany(
    {
        projectType: { $exists: false },
        $or: commercialPatterns.map(re => ({ category: { $regex: re } }))
    },
    { $set: { projectType: 'commercial' } }
)
console.log(`Set 'commercial' on ${commercialResult.modifiedCount} projects`)

// Set residential for remaining
const residentialResult = await Project.updateMany(
    { projectType: { $exists: false } },
    { $set: { projectType: 'residential' } }
)
console.log(`Set 'residential' on ${residentialResult.modifiedCount} projects`)

const remaining = await Project.countDocuments({ projectType: { $exists: false } })
console.log(`Remaining documents without projectType: ${remaining}`)

await mongoose.disconnect()
process.exit(0)
