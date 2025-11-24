import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'site-config.json')

export async function GET() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8')
        const config = JSON.parse(data)
        return NextResponse.json(config)
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

        const updatedConfig = { ...config, ...updates }
        fs.writeFileSync(dataPath, JSON.stringify(updatedConfig, null, 2))

        return NextResponse.json(updatedConfig)
    } catch (error) {
        console.error('Error updating site config:', error)
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
    }
}
