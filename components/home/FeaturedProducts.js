'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ui/ProductCard'
import { ChevronRight, Sparkles } from 'lucide-react'
import styles from './FeaturedProducts.module.css'

export default function FeaturedProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadFeaturedProducts()
    }, [])

    const loadFeaturedProducts = async () => {
        try {
            const res = await fetch('/api/products')
            const data = await res.json()

            // Handle new API response format {products: [], pagination: {}}
            const productList = data.products || data

            // Filter products with highlight="Featured" or "New" or just take first 6
            const featured = productList
                .filter(p => p.highlight === 'Featured' || p.highlight === 'New' || p.discount > 0)
                .slice(0, 6)

            // If we don't have enough featured, just take the first 6 products
            const finalProducts = featured.length >= 4 ? featured : productList.slice(0, 6)

            setProducts(finalProducts)
        } catch (error) {
            console.error('Failed to load featured products:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className={styles.featured}>
                <div className="container">
                    <div className={styles.loading}>Loading featured products...</div>
                </div>
            </section>
        )
    }

    if (products.length === 0) {
        return null
    }

    return (
        <section className={styles.featured}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.titleWrapper}>
                        <Sparkles className={styles.sparkleIcon} size={32} />
                        <h2 className="section-title">Featured Collection</h2>
                    </div>
                    <p className={styles.subtitle}>
                        Handpicked masterpieces showcasing our finest craftsmanship
                    </p>
                    <Link href="/products" className={styles.viewAll}>
                        View All Products <ChevronRight size={20} />
                    </Link>
                </div>

                <div className={styles.grid}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {products.length > 0 && (
                    <div className={styles.cta}>
                        <Link href="/products" className="btn btn-primary">
                            Explore Full Collection
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}
