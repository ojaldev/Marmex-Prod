'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Gem, Layers, Wine, Frame, Gift, Gamepad2, ArrowRight, Loader2
} from 'lucide-react'
import styles from './CategoryStrip.module.css'

const CATEGORY_ICONS = {
    'Stone Sculptures': Gem,
    'Stone Carvings': Layers,
    'Dining Décor': Wine,
    'Wall Art': Frame,
    'Personalized Gifts': Gift,
    'Marble Games': Gamepad2,
}

const CATEGORY_GRADIENTS = [
    'linear-gradient(135deg, #f5f0eb 0%, #e8dfd4 100%)',
    'linear-gradient(135deg, #e8e4e0 0%, #ddd8d2 100%)',
    'linear-gradient(135deg, #f0ebe5 0%, #e5ddd4 100%)',
    'linear-gradient(135deg, #e5e0db 0%, #dbd5ce 100%)',
    'linear-gradient(135deg, #f2ede8 0%, #e8e0d8 100%)',
    'linear-gradient(135deg, #ebe6e1 0%, #e0d9d0 100%)',
]

export default function CategoryStrip() {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/products')
                ])
                const cats = await catRes.json()
                const prodsData = await prodRes.json()
                const prods = prodsData.products || prodsData || []

                const catsWithCount = (Array.isArray(cats) ? cats : []).map(cat => ({
                    ...cat,
                    productCount: prods.filter(p => p.category === cat.name).length
                }))

                setCategories(catsWithCount)
                setProducts(prods)
            } catch (error) {
                console.error('Failed to load categories:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.scrollContainer}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={styles.skeletonChip} />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (!categories.length) return null

    return (
        <section className={styles.section}>
            <div className="container">
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className={styles.title}>Shop by Category</h2>
                    <Link href="/products" className={styles.viewAll}>
                        View All <ArrowRight size={16} />
                    </Link>
                </motion.div>

                <div className={styles.scrollContainer}>
                    {categories.map((cat, index) => {
                        const Icon = CATEGORY_ICONS[cat.name] || Gem
                        const gradient = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length]

                        return (
                            <motion.div
                                key={cat.id || cat._id || cat.slug}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                                    className={styles.chip}
                                    style={{ background: gradient }}
                                >
                                    <div className={styles.iconWrapper}>
                                        <Icon size={22} />
                                    </div>
                                    <span className={styles.chipLabel}>{cat.name}</span>
                                    <span className={styles.chipCount}>
                                        {cat.productCount || 0}
                                    </span>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
