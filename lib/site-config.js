import fs from 'fs'
import path from 'path'
import connectDB from '@/lib/mongodb'
import SiteConfig from '@/models/SiteConfig'

function readJsonFallback() {
    try {
        const raw = fs.readFileSync(
            path.join(process.cwd(), 'data', 'site-config.json'),
            'utf8'
        )
        return JSON.parse(raw)
    } catch {
        return {}
    }
}

export function deepMerge(target, source) {
    const result = { ...target }
    for (const key of Object.keys(source)) {
        if (
            source[key] !== null &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key]) &&
            typeof target[key] === 'object' &&
            !Array.isArray(target[key])
        ) {
            result[key] = deepMerge(target[key] || {}, source[key])
        } else {
            result[key] = source[key]
        }
    }
    return result
}

export async function getSiteConfig() {
    await connectDB()
    let doc = await SiteConfig.findOne({ key: 'default' }).lean()
    if (!doc) {
        // First run: seed from the JSON file so nothing is lost
        const seed = readJsonFallback()
        const created = await SiteConfig.create({ key: 'default', data: seed })
        return created.data || {}
    }
    return doc.data || {}
}

export async function updateSiteConfig(updates) {
    await connectDB()
    const current = await getSiteConfig()
    const merged = deepMerge(current, updates)
    await SiteConfig.findOneAndUpdate(
        { key: 'default' },
        { data: merged },
        { upsert: true, new: true }
    )
    return merged
}
