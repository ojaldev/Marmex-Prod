import { NextResponse } from 'next/server'
import { getSiteConfig, updateSiteConfig } from '@/lib/site-config'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
    try {
        const config = await getSiteConfig()
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
        const denied = await requireAdmin(request)
        if (denied) return denied

        const updates = await request.json()
        const merged = await updateSiteConfig(updates)
        return NextResponse.json(merged)
    } catch (error) {
        console.error('Error updating site config:', error)
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
    }
}
