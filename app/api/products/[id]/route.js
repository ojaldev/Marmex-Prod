import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request, { params }) {
    try {
        const { id } = await params

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
        const updateData = await request.json()

        await connectDB()

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
        const { deleteImageFromUrl } = await import('@/lib/cloudinary');
        
        // Collect all image URLs
        const imagesToDelete = [];
        if (product.mainImage) imagesToDelete.push(product.mainImage);
        if (product.additionalImages && product.additionalImages.length > 0) {
            imagesToDelete.push(...product.additionalImages);
        }
        if (product.lifestyleImages && product.lifestyleImages.length > 0) {
            imagesToDelete.push(...product.lifestyleImages);
        }
        if (product.packagingImages && product.packagingImages.length > 0) {
            imagesToDelete.push(...product.packagingImages);
        }

        // Delete all images without blocking the response
        Promise.allSettled(imagesToDelete.map(url => deleteImageFromUrl(url)))
            .then(results => console.log(`Deleted ${results.filter(r => r.status === 'fulfilled').length} images for product ${id}`))
            .catch(err => console.error('Error during product image cleanup:', err));

        return NextResponse.json({ message: 'Product deleted successfully' })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
}
