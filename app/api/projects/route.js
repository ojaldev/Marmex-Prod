import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

const VALID_PROJECT_TYPES = ['residential', 'commercial']

function sanitizeProjectData(data) {
    const sanitized = { ...data }
    if (sanitized.projectType && !VALID_PROJECT_TYPES.includes(sanitized.projectType)) {
        delete sanitized.projectType
    }
    if (Array.isArray(sanitized.relatedProducts)) {
        sanitized.relatedProducts = sanitized.relatedProducts.filter(id =>
            mongoose.Types.ObjectId.isValid(id)
        )
    }
    return sanitized
}

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const featured = searchParams.get('featured')
        const projectType = searchParams.get('projectType')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        let query = {}

        if (category) {
            query.category = category
        }

        if (featured === 'true') {
            query.featured = true
        }

        if (projectType && VALID_PROJECT_TYPES.includes(projectType)) {
            query.projectType = projectType
        }

        let projectsQuery = Project.find(query)
            .sort({ featured: -1, completionDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)

        let projects
        try {
            projects = await projectsQuery
                .populate('relatedProducts', 'name mainImage price discount category stock')
                .lean()
        } catch {
            projects = await Project.find(query)
                .sort({ featured: -1, completionDate: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        }

        // lean() skips Mongoose schema defaults — apply them manually so old
        // documents created before projectType existed get the correct fallback.
        projects = projects.map(p => ({
            ...p,
            projectType: p.projectType || 'residential',
            relatedProducts: (p.relatedProducts || []).filter(Boolean)
        }))

        const total = await Project.countDocuments(query)

        return NextResponse.json({
            projects,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        })
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const raw = await request.json()
        const projectData = sanitizeProjectData(raw)

        const project = await Project.create(projectData)

        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json({
            error: 'Failed to create project',
            message: error.message
        }, { status: 500 })
    }
}
