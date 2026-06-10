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

async function getCategories(products = []) {
    try {
        await connectDB()
        const categories = await Category.find({})
            .sort({ order: 1, name: 1 })
            .lean()

        const catsWithCount = categories.map(cat => ({
            ...cat,
            count: products.filter(p => p.category === cat.name).length
        }))

        // Only return categories that have at least one product
        return JSON.parse(JSON.stringify(catsWithCount.filter(c => c.count > 0)))
    } catch (error) {
        console.error('Server: failed to fetch categories:', error)
        return []
    }
}

export default async function ProductsPage({ searchParams }) {
    const params = await searchParams
    const initialCategory = params?.category || 'all'
    const initialSearchQuery = params?.search || ''

    const products = await getProducts()
    const categories = await getCategories(products)

    return (
        <ProductsPageClient
            initialProducts={products}
            initialCategories={categories}
            initialCategory={initialCategory}
            initialSearchQuery={initialSearchQuery}
        />
    )
}
