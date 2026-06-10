'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ui/ProductCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { ProductListSkeleton } from '@/components/ui/SkeletonLoader'
import { fadeInUp, staggerContainer } from '@/lib/animations'
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
            const productList = data.products || data

            const featured = productList
                .filter(p => p.highlight === 'Featured' || p.highlight === 'New' || p.discount > 0)
                .slice(0, 6)

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
                    <ProductListSkeleton count={6} columns={3} />
                </div>
            </section>
        )
    }

    if (products.length === 0) return null

    return (
        <section className={styles.featured}>
            <div className="container">
                <SectionHeader
                    title="Featured Collection"
                    subtitle="Handpicked masterpieces showcasing our finest craftsmanship"
                    action={
                        <Link href="/products" className="btn btn-primary">
                            View All Products
                        </Link>
                    }
                />

                <motion.div
                    className={styles.grid}
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                >
                    {products.map((product, index) => (
                        <div key={product._id || index}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
