import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Category from '@/models/Category'
import ProductsPageClient from './ProductsPageClient'

async function getProducts() {
    try {
        await connectDB()
        const products = await Product.find({})
            .select('name category price discount mainImage stock highlight shortDescription tags createdAt')
            .sort({ createdAt: -1 })
            .limit(100)
            .lean()
        return JSON.parse(JSON.stringify(products))
    } catch (error) {
        console.error('Server: failed to fetch products:', error)
        return []
    }
}

async function getCategories() {
    try {
        await connectDB()
        const categories = await Category.find({})
            .sort({ order: 1, name: 1 })
            .lean()
        return JSON.parse(JSON.stringify(categories))
    } catch (error) {
        console.error('Server: failed to fetch categories:', error)
        return []
    }
}

export default async function ProductsPage({ searchParams }) {
    const params = await searchParams
    const initialCategory = params?.category || 'all'
    const initialSearchQuery = params?.search || ''

    const [products, categories] = await Promise.all([
        getProducts(),
        getCategories()
    ])

    return (
        <ProductsPageClient
            initialProducts={products}
            initialCategories={categories}
            initialCategory={initialCategory}
            initialSearchQuery={initialSearchQuery}
        />
    )
}
