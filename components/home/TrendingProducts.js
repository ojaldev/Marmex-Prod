'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ui/ProductCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import styles from './TrendingProducts.module.css'

export default function TrendingProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef(null)

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            const res = await fetch('/api/products')
            const data = await res.json()
            const productList = data.products || data
            // Get trending: bestsellers, most viewed, or just random selection
            const trending = productList
                .filter(p => p.highlight === 'Bestseller' || p.highlight === 'Featured')
                .slice(0, 8)
            setProducts(trending.length >= 4 ? trending : productList.slice(0, 8))
        } catch (error) {
            console.error('Failed to load trending products:', error)
        } finally {
            setLoading(false)
        }
    }

    const scroll = (direction) => {
        if (!scrollRef.current) return
        const scrollAmount = 320
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        })
    }

    if (loading || products.length === 0) return null

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.headerRow}>
                    <SectionHeader
                        title="Trending Now"
                        subtitle="Most loved pieces by our community"
                        align="left"
                        decorated={false}
                        className="!mb-0"
                    />
                    <div className={styles.navButtons}>
                        <motion.button
                            onClick={() => scroll('left')}
                            className={styles.navBtn}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={20} />
                        </motion.button>
                        <motion.button
                            onClick={() => scroll('right')}
                            className={styles.navBtn}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={20} />
                        </motion.button>
                    </div>
                </div>

                <div className={styles.scrollContainer} ref={scrollRef}>
                    <div className={styles.productRow}>
                        {products.map((product, index) => (
                            <motion.div
                                key={product._id || index}
                                className={styles.productSlide}
                                initial={{ opacity: 0, x: 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, duration: 0.5 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className={styles.viewAll}>
                    <Link href="/products" className="btn btn-outline">
                        View All Trending
                        <TrendingUp size={18} />
                    </Link>
                </div>
            </div>
        </section>
    )
}
