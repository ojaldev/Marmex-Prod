import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { validateDimensions, validateWeight, formatDimensions, formatWeight } from '@/lib/product-specs'
import { deleteResourceFromUrl } from '@/lib/cloudinary'

export async function GET(request, { params }) {
    try {
        const { id } = await params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 404 })
        }

        await connectDB()

        const product = await Product.findById(id).lean()

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params
        let updateData = await request.json()

        await connectDB()

        // Validate & normalize dimensions if provided as structured object
        if (updateData.dimensions && typeof updateData.dimensions === 'object') {
            const dimValidation = validateDimensions(updateData.dimensions)
            if (!dimValidation.valid) {
                return NextResponse.json({ error: dimValidation.error }, { status: 400 })
            }
            updateData.dimensions = formatDimensions(updateData.dimensions)
        }

        // Validate & normalize weight if provided as structured object
        if (updateData.weight && typeof updateData.weight === 'object') {
            const weightValidation = validateWeight(updateData.weight)
            if (!weightValidation.valid) {
                return NextResponse.json({ error: weightValidation.error }, { status: 400 })
            }
            updateData.weight = formatWeight(updateData.weight)
        }

        // Fetch existing product to compare videos
        const existingProduct = await Product.findById(id).lean()
        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Clean up removed videos from Cloudinary
        const oldVideos = existingProduct.videos || []
        const newVideos = updateData.videos || []
        const removedVideos = oldVideos.filter(oldV =>
            !newVideos.some(newV => newV.publicId === oldV.publicId)
        )

        if (removedVideos.length > 0) {
            Promise.allSettled(removedVideos.map(v => deleteResourceFromUrl(v.url, 'video')))
                .then(results => console.log(`🗑️ Deleted ${results.filter(r => r.status === 'fulfilled').length} videos from Cloudinary`))
                .catch(err => console.error('Video cleanup error:', err))
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json({
            error: 'Failed to update product',
            message: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params

        await connectDB()

        const product = await Product.findByIdAndDelete(id)

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Clean up images from Cloudinary
        const imagesToDelete = []
        if (product.mainImage) imagesToDelete.push(product.mainImage)
        if (product.additionalImages?.length) imagesToDelete.push(...product.additionalImages)
        if (product.lifestyleImages?.length) imagesToDelete.push(...product.lifestyleImages)
        if (product.packagingImages?.length) imagesToDelete.push(...product.packagingImages)
        if (product.videoThumbnail) imagesToDelete.push(product.videoThumbnail)

        Promise.allSettled(imagesToDelete.map(url => deleteResourceFromUrl(url, 'image')))
            .then(results => console.log(`🗑️ Deleted ${results.filter(r => r.status === 'fulfilled').length} images from Cloudinary`))
            .catch(err => console.error('Image cleanup error:', err))

        // Clean up videos from Cloudinary
        if (product.videos?.length) {
            Promise.allSettled(product.videos.map(v => deleteResourceFromUrl(v.url, 'video')))
                .then(results => console.log(`🗑️ Deleted ${results.filter(r => r.status === 'fulfilled').length} videos from Cloudinary`))
                .catch(err => console.error('Video cleanup error:', err))
        }

        return NextResponse.json({ message: 'Product deleted successfully' })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
}
