'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Star, Users, Award, Loader2, MessageCircle, ChevronDown } from 'lucide-react'
import { heroTextReveal, staggerContainer } from '@/lib/animations'
import styles from './HeroSection.module.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop'

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

    const heroImage = hero?.image || FALLBACK_IMAGE
    const title = hero?.title || 'Luxury Marble & Stone Art'
    const subtitle = hero?.subtitle || 'Handcrafted Perfection for Your Space'

    const stats = [
        { icon: Users, number: hero?.stats?.customers || '5000+', label: 'Happy Customers' },
        { icon: Award, number: hero?.stats?.designs || '300+', label: 'Unique Designs' },
        { icon: Star, number: hero?.stats?.rating || '4.8', label: 'Average Rating' },
    ]

    if (hero === null) {
        return (
            <section className={styles.hero}>
                <div className={styles.skeletonOverlay}>
                    <Loader2 className="animate-spin text-[var(--color-gold-24k)]" size={40} />
                </div>
            </section>
        )
    }

    return (
        <section className={styles.hero}>
            {/* Background Image */}
            <div
                className={`${styles.bgImage} ${imageLoaded ? styles.loaded : ''}`}
                style={{ backgroundImage: `url(${heroImage})` }}
            />
            <img
                src={heroImage}
                alt=""
                style={{ display: 'none' }}
                onLoad={() => setImageLoaded(true)}
            />

            {/* Dark Overlay */}
            <div className={styles.overlay} />

            {/* Content */}
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
                    {title}
                </motion.h1>

                <motion.p
                    className={styles.subtitle}
                    variants={heroTextReveal}
                    custom={2}
                    initial="hidden"
                    animate="visible"
                >
                    {subtitle}
                </motion.p>

                <motion.div
                    className={styles.stats}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {stats.map((stat) => (
                        <motion.div
                            key={stat.label}
                            className={styles.stat}
                            variants={heroTextReveal}
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
                    <a
                        href="https://wa.me/919582134493?text=Hi%20Marmex%20India%2C%20I%20am%20interested%20in%20your%20marble%20products."
                        className={styles.whatsappBtn}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <MessageCircle size={18} />
                        Chat on WhatsApp
                    </a>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className={styles.scrollIndicator}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                    <ChevronDown size={24} />
                </motion.div>
            </motion.div>
        </section>
    )
}
