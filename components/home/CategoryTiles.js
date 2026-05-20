'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import styles from './CategoryTiles.module.css'

export default function CategoryTiles() {
    const [categories, setCategories] = useState([])
    const [productCounts, setProductCounts] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/products').then(r => r.json())
        ])
            .then(([categoriesData, productsData]) => {
                const productList = productsData.products || productsData
                setCategories(categoriesData)

                // Count products per category
                const counts = {}
                categoriesData.forEach(cat => {
                    counts[cat.name] = productList.filter(p => p.category === cat.name).length
                })
                setProductCounts(counts)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load categories:', err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <section className="section">
                <div className="container">
                    <div className="section-title">Explore Our Collections</div>
                    <div className={styles.grid}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={styles.skeletonTile} />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="section">
            <div className="container">
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    Explore Our Collections
                </motion.h2>

                <motion.div
                    className={styles.grid}
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                >
                    {categories.map((category, index) => {
                        const count = productCounts[category.name] || 0
                        return (
                            <motion.div
                                key={category._id || category.id || index}
                                variants={fadeInUp}
                            >
                                <Link
                                    href={`/products?category=${category.slug || category.name}`}
                                    className={styles.tile}
                                >
                                    {/* Background Image */}
                                    <div
                                        className={styles.tileImage}
                                        style={{
                                            backgroundImage: category.image
                                                ? `url(${category.image})`
                                                : 'none'
                                        }}
                                    />

                                    {/* Dark Overlay for contrast */}
                                    <div className={styles.tileOverlay} />

                                    {/* Product count badge */}
                                    {count > 0 && (
                                        <span className={styles.tileBadge}>
                                            {count} Product{count !== 1 ? 's' : ''}
                                        </span>
                                    )}

                                    {/* Content - always visible */}
                                    <div className={styles.tileContent}>
                                        <h3 className={styles.tileName}>{category.name}</h3>
                                        {category.description && (
                                            <p className={styles.tileDesc}>{category.description}</p>
                                        )}
                                        <span className={styles.tileLink}>
                                            View Collection
                                            <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </div>
        </section>
    )
}
