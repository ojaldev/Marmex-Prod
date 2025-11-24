import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const featured = searchParams.get('featured')
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

        const projects = await Project.find(query)
            .sort({ featured: -1, completionDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        const total = await Project.countDocuments(query)

        return NextResponse.json({
            projects,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
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

        const projectData = await request.json()

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
