import { notFound } from 'next/navigation'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Review from '@/models/Review'
import Order from '@/models/Order'
import Project from '@/models/Project'
import ProductDetailClient from './ProductDetailClient'

function serializeDoc(doc) {
    if (!doc) return doc
    const serialized = JSON.parse(JSON.stringify(doc))
    if (serialized._id) {
        serialized.id = serialized._id.toString()
    }
    return serialized
}

function serializeDocs(docs) {
    return docs.map(serializeDoc)
}

function buildReviewSummary(reviews) {
    if (!reviews || reviews.length === 0) {
        return {
            average: 0,
            total: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
    }
    const total = reviews.length
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
        const rating = Math.min(5, Math.max(1, Math.round(r.rating || 0)))
        distribution[rating] = (distribution[rating] || 0) + 1
    })
    return { average: sum / total, total, distribution }
}

function buildProductSchema(product, reviewSummary, discountedPrice) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: [product.mainImage, ...(product.additionalImages || [])].filter(Boolean),
        description: product.shortDescription || product.detailedDescription || product.name,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: 'Marmex India'
        },
        offers: {
            '@type': 'Offer',
            url: `https://marmex-prod-production.up.railway.app/products/${product.id}`,
            priceCurrency: 'INR',
            price: discountedPrice || product.price,
            availability:
                product.stock === 'In Stock'
                    ? 'https://schema.org/InStock'
                    : product.stock === 'Made to Order'
                        ? 'https://schema.org/PreOrder'
                        : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                    '@type': 'MonetaryAmount',
                    value: '0',
                    currency: 'INR'
                },
                shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'IN'
                }
            },
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 30,
                returnMethod: 'https://schema.org/ReturnByMail',
                returnFees: 'https://schema.org/FreeReturn'
            }
        },
        ...(reviewSummary.total > 0
            ? {
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: Number(reviewSummary.average.toFixed(1)),
                    reviewCount: reviewSummary.total,
                    bestRating: 5,
                    worstRating: 1
                }
            }
            : {}),
        ...(product.material ? { material: product.material } : {}),
        ...(product.weight
            ? { weight: { '@type': 'QuantitativeValue', value: product.weight } }
            : {}),
        ...(product.dimensions ? { size: product.dimensions } : {})
    }
}

function buildBreadcrumbSchema(product) {
    const baseUrl = 'https://marmex-prod-production.up.railway.app'
    const items = [
        { name: 'Home', url: baseUrl },
        { name: 'Products', url: `${baseUrl}/products` },
        ...(product.category
            ? [{ name: product.category, url: `${baseUrl}/products?category=${encodeURIComponent(product.category)}` }]
            : []),
        { name: product.name, url: `${baseUrl}/products/${product.id}` }
    ]
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { title: 'Product Not Found | Marmex India' }
    }

    let product = null
    try {
        await connectDB()
        product = await Product.findById(id).lean()
    } catch {
        product = null
    }

    if (!product) {
        return { title: 'Product Not Found | Marmex India' }
    }

    return {
        title: `${product.name} | Marmex India`,
        description:
            product.shortDescription ||
            product.metaDescription ||
            `Shop ${product.name} at Marmex India.`,
        openGraph: {
            title: product.name,
            description: product.shortDescription || product.metaDescription || '',
            images: product.mainImage ? [{ url: product.mainImage }] : []
        }
    }
}

export default async function ProductDetailPage({ params }) {
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        notFound()
    }

    await connectDB()

    let productDoc = null
    try {
        productDoc = await Product.findById(id).lean()
    } catch {
        notFound()
    }

    if (!productDoc) {
        notFound()
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [allProductsDocs, reviewsDocs, soldAgg, featuredInDocs] = await Promise.all([
        Product.find({})
            .select('name category price discount mainImage stock highlight shortDescription')
            .lean(),
        Review.find({ product: id, status: 'approved' }).lean(),
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $nin: ['cancelled'] },
                    'items.productId': id
                }
            },
            { $unwind: '$items' },
            { $match: { 'items.productId': id } },
            { $group: { _id: null, units: { $sum: '$items.quantity' } } }
        ]).catch(() => []),
        Project.find({ relatedProducts: id })
            .select('name afterImage location projectType')
            .limit(2)
            .lean()
            .catch(() => [])
    ])

    const soldRecently = soldAgg?.[0]?.units || 0
    const featuredIn = serializeDocs(featuredInDocs)

    const product = serializeDoc(productDoc)
    const allProducts = serializeDocs(allProductsDocs)
    const reviews = serializeDocs(reviewsDocs)

    const reviewSummary = buildReviewSummary(reviews)

    const relatedProducts = allProducts
        .filter(p => (p.id || p._id?.toString()) !== product.id && p.category === product.category)
        .slice(0, 4)

    const discountedPrice =
        product.discount > 0
            ? Math.round(product.price * (100 - product.discount) / 100)
            : null

    const productSchema = buildProductSchema(product, reviewSummary, discountedPrice)
    const breadcrumbSchema = buildBreadcrumbSchema(product)

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <ProductDetailClient
                product={product}
                allProducts={allProducts}
                relatedProducts={relatedProducts}
                reviewSummary={reviewSummary}
                soldRecently={soldRecently}
                featuredIn={featuredIn}
            />
        </>
    )
}
