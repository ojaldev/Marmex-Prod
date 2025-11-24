import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET(request, { params }) {
    try {
        const { id } = await params

        await connectDB()

        const project = await Project.findById(id).lean()

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        return NextResponse.json(project)
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params
        const updateData = await request.json()

        await connectDB()

        const project = await Project.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        return NextResponse.json(project)
    } catch (error) {
        console.error('Error updating project:', error)
        return NextResponse.json({
            error: 'Failed to update project',
            message: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params

        await connectDB()

        const project = await Project.findByIdAndDelete(id)

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Project deleted successfully' })
    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }
}
