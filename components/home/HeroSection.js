'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, Palette, ArrowRight, Star, Users, Award, Loader2 } from 'lucide-react'
import { heroTextReveal, staggerContainer } from '@/lib/animations'
import styles from './HeroSection.module.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'

export default function HeroSection() {
    const [hero, setHero] = useState(null)
    const [imageLoaded, setImageLoaded] = useState(false)

    useEffect(() => {
        loadHero()
    }, [])

    const loadHero = async () => {
        try {
            const res = await fetch('/api/site-config')
            const data = await res.json()
            setHero(data.hero || {})
        } catch (error) {
            console.error('Failed to load hero:', error)
            setHero({})
        }
    }

    if (hero === null) {
        return (
            <section className={styles.hero}>
                <div className={styles.bentoGrid}>
                    <div className={`${styles.block} ${styles.mainBlock} ${styles.skeleton}`}>
                        <Loader2 className="animate-spin text-[var(--color-gold-24k)]" size={32} />
                    </div>
                    <div className={`${styles.block} ${styles.imageBlock} ${styles.skeleton}`} />
                    <div className={`${styles.block} ${styles.accentBlock} ${styles.skeleton}`} />
                    <div className={`${styles.block} ${styles.accentBlock} ${styles.skeleton}`} />
                </div>
            </section>
        )
    }

    const heroImage = hero.image || FALLBACK_IMAGE

    const stats = [
        { icon: Users, number: '5000+', label: 'Happy Customers' },
        { icon: Award, number: '300+', label: 'Unique Designs' },
        { icon: Star, number: '4.9', label: 'Average Rating' },
    ]

    return (
        <section className={styles.hero}>
            <div className={styles.bentoGrid}>
                {/* Main Content Block */}
                <motion.div
                    className={`${styles.block} ${styles.mainBlock}`}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                >
                    <div className={styles.content}>
                        <motion.div
                            className={styles.badge}
                            variants={heroTextReveal}
                            custom={0}
                            initial="hidden"
                            animate="visible"
                        >
                            <Sparkles size={16} />
                            <span>Premium Craftsmanship</span>
                        </motion.div>

                        <motion.h1
                            className={styles.title}
                            variants={heroTextReveal}
                            custom={1}
                            initial="hidden"
                            animate="visible"
                        >
                            {hero.title || 'Luxury Marble & Stone Art'}
                        </motion.h1>

                        <motion.p
                            className={styles.subtitle}
                            variants={heroTextReveal}
                            custom={2}
                            initial="hidden"
                            animate="visible"
                        >
                            {hero.subtitle || 'Handcrafted Perfection for Your Space'}
                        </motion.p>

                        <motion.div
                            className={styles.stats}
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    className={styles.stat}
                                    variants={heroTextReveal}
                                    custom={3 + i}
                                >
                                    <div className={styles.statIcon}>
                                        <stat.icon size={18} />
                                    </div>
                                    <div className={styles.statContent}>
                                        <div className={styles.statNumber}>{stat.number}</div>
                                        <div className={styles.statLabel}>{stat.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            className={styles.actions}
                            variants={heroTextReveal}
                            custom={6}
                            initial="hidden"
                            animate="visible"
                        >
                            <Link href="/products" className={styles.primaryBtn}>
                                Shop Now
                                <ArrowRight size={18} />
                            </Link>
                            <Link href="/custom" className={styles.outlineBtn}>
                                Custom Orders
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Featured Image Block */}
                <motion.div
                    className={`${styles.block} ${styles.imageBlock}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
                >
                    <div
                        className={`${styles.heroImage} ${imageLoaded ? styles.loaded : ''}`}
                        style={{ backgroundImage: `url(${heroImage})` }}
                    >
                        <div className={styles.imageGradient} />
                        <motion.div
                            className={styles.imageLabel}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        >
                            <span className={styles.labelTag}>Featured</span>
                            <span className={styles.labelText}>Handcrafted Excellence</span>
                        </motion.div>
                    </div>
                    <img
                        src={heroImage}
                        alt=""
                        style={{ display: 'none' }}
                        onLoad={() => setImageLoaded(true)}
                    />
                </motion.div>

                {/* Accent Block 1 - New Arrivals */}
                <motion.div
                    className={`${styles.block} ${styles.accentBlock}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
                >
                    <Link href="/products?filter=new" className={styles.accentLink}>
                        <div className={styles.accentIconWrapper}>
                            <Sparkles size={24} />
                        </div>
                        <div className={styles.accentContent}>
                            <h3>New Arrivals</h3>
                            <p>Discover our latest designs</p>
                        </div>
                        <motion.div
                            className={styles.accentArrow}
                            whileHover={{ x: 4 }}
                        >
                            <ArrowRight size={20} />
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Accent Block 2 - Custom Orders */}
                <motion.div
                    className={`${styles.block} ${styles.accentBlock} ${styles.accentAlt}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
                >
                    <Link href="/custom" className={styles.accentLink}>
                        <div className={styles.accentIconWrapper}>
                            <Palette size={24} />
                        </div>
                        <div className={styles.accentContent}>
                            <h3>Custom Orders</h3>
                            <p>Create your personalized art</p>
                        </div>
                        <motion.div
                            className={styles.accentArrow}
                            whileHover={{ x: 4 }}
                        >
                            <ArrowRight size={20} />
                        </motion.div>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
