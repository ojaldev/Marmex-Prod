import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'site-config.json')

function deepMerge(target, source) {
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

export async function GET() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8')
        const config = JSON.parse(data)
        return NextResponse.json(config, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        })
    } catch (error) {
        console.error('Error reading site config:', error)
        return NextResponse.json({}, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        const updates = await request.json()
        const data = fs.readFileSync(dataPath, 'utf8')
        const config = JSON.parse(data)

        // Deep merge so nested keys (e.g. pricing.gstRate) aren't wiped
        const updatedConfig = deepMerge(config, updates)
        fs.writeFileSync(dataPath, JSON.stringify(updatedConfig, null, 2))

        return NextResponse.json(updatedConfig)
    } catch (error) {
        console.error('Error updating site config:', error)
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
    }
}
