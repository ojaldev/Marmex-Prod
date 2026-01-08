'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Palette, ArrowRight, Star, Users, Award } from 'lucide-react'
import styles from './HeroSection.module.css'

// Default fallback image
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
            setHero({}) // Set empty object to show default content
        }
    }

    // Show skeleton while loading
    if (hero === null) {
        return (
            <section className={styles.hero}>
                <div className={styles.bentoGrid}>
                    <div className={`${styles.block} ${styles.mainBlock} ${styles.skeleton}`} />
                    <div className={`${styles.block} ${styles.imageBlock} ${styles.skeleton}`} />
                    <div className={`${styles.block} ${styles.accentBlock} ${styles.skeleton}`} />
                    <div className={`${styles.block} ${styles.accentBlock} ${styles.skeleton}`} />
                </div>
            </section>
        )
    }

    const heroImage = hero.image || FALLBACK_IMAGE

    return (
        <section className={styles.hero}>
            <div className={styles.bentoGrid}>
                {/* Main Content Block */}
                <div className={`${styles.block} ${styles.mainBlock}`}>
                    <div className={styles.content}>
                        <div className={styles.badge}>
                            <Sparkles size={16} />
                            <span>Premium Craftsmanship</span>
                        </div>

                        <h1 className={styles.title}>
                            {hero.title || 'Luxury Marble & Stone Art'}
                        </h1>
                        <p className={styles.subtitle}>
                            {hero.subtitle || 'Handcrafted Perfection for Your Space'}
                        </p>

                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <div className={styles.statIcon}><Users size={18} /></div>
                                <div className={styles.statContent}>
                                    <div className={styles.statNumber}>5000+</div>
                                    <div className={styles.statLabel}>Happy Customers</div>
                                </div>
                            </div>
                            <div className={styles.stat}>
                                <div className={styles.statIcon}><Award size={18} /></div>
                                <div className={styles.statContent}>
                                    <div className={styles.statNumber}>300+</div>
                                    <div className={styles.statLabel}>Unique Designs</div>
                                </div>
                            </div>
                            <div className={styles.stat}>
                                <div className={styles.statIcon}><Star size={18} /></div>
                                <div className={styles.statContent}>
                                    <div className={styles.statNumber}>4.9</div>
                                    <div className={styles.statLabel}>Average Rating</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <Link href="/products" className={styles.primaryBtn}>
                                Shop Now
                                <ArrowRight size={18} />
                            </Link>
                            <Link href="/custom" className={styles.outlineBtn}>
                                Custom Orders
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Featured Image Block */}
                <div className={`${styles.block} ${styles.imageBlock}`}>
                    <div
                        className={`${styles.heroImage} ${imageLoaded ? styles.loaded : ''}`}
                        style={{ backgroundImage: `url(${heroImage})` }}
                    >
                        <div className={styles.imageGradient} />
                        <div className={styles.imageLabel}>
                            <span className={styles.labelTag}>Featured</span>
                            <span className={styles.labelText}>Handcrafted Excellence</span>
                        </div>
                    </div>
                    <img
                        src={heroImage}
                        alt=""
                        style={{ display: 'none' }}
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>

                {/* Accent Block 1 - New Arrivals */}
                <Link href="/products?filter=new" className={`${styles.block} ${styles.accentBlock}`}>
                    <div className={styles.accentIconWrapper}>
                        <Sparkles size={24} />
                    </div>
                    <div className={styles.accentContent}>
                        <h3>New Arrivals</h3>
                        <p>Discover our latest designs</p>
                    </div>
                    <div className={styles.accentArrow}>
                        <ArrowRight size={20} />
                    </div>
                </Link>

                {/* Accent Block 2 - Custom Orders */}
                <Link href="/custom" className={`${styles.block} ${styles.accentBlock} ${styles.accentAlt}`}>
                    <div className={styles.accentIconWrapper}>
                        <Palette size={24} />
                    </div>
                    <div className={styles.accentContent}>
                        <h3>Custom Orders</h3>
                        <p>Create your personalized art</p>
                    </div>
                    <div className={styles.accentArrow}>
                        <ArrowRight size={20} />
                    </div>
                </Link>
            </div>
        </section>
    )
}
