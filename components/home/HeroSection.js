'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './HeroSection.module.css'

export default function HeroSection() {
    const [hero, setHero] = useState(null)

    useEffect(() => {
        loadHero()
    }, [])

    const loadHero = async () => {
        try {
            const res = await fetch('/api/site-config')
            const data = await res.json()
            setHero(data.hero)
        } catch (error) {
            console.error('Failed to load hero:', error)
        }
    }

    if (!hero) {
        return null
    }

    return (
        <section className={styles.hero}>
            <div className={styles.bentoGrid}>
                {/* Main Content Block */}
                <div className={`${styles.block} ${styles.mainBlock}`}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>{hero.title || 'Exquisite Marble Craftsmanship'}</h1>
                        <p className={styles.subtitle}>{hero.subtitle || 'Handcrafted luxury marble gifts & stone art'}</p>

                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <div className={styles.statNumber}>5000+</div>
                                <div className={styles.statLabel}>Happy Customers</div>
                            </div>
                            <div className={styles.stat}>
                                <div className={styles.statNumber}>300+</div>
                                <div className={styles.statLabel}>Unique Designs</div>
                            </div>
                            <div className={styles.stat}>
                                <div className={styles.statNumber}>4.9</div>
                                <div className={styles.statLabel}>Average Rating</div>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <Link href="/products" className="btn btn-primary">
                                Shop Now
                            </Link>
                            <Link href="/custom" className="btn btn-outline">
                                Custom Orders
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Featured Image Block */}
                <div className={`${styles.block} ${styles.imageBlock}`}>
                    {hero.image && (
                        <div
                            className={styles.heroImage}
                            style={{ backgroundImage: `url(${hero.image})` }}
                        >
                            <div className={styles.imageOverlay} />
                        </div>
                    )}
                </div>

                {/* Accent Block 1 - New Arrivals */}
                <div className={`${styles.block} ${styles.accentBlock}`}>
                    <div className={styles.accentIcon}>✨</div>
                    <h3>New Arrivals</h3>
                    <p>Latest designs</p>
                    <Link href="/products?filter=new">Explore →</Link>
                </div>

                {/* Accent Block 2 - Custom Orders */}
                <div className={`${styles.block} ${styles.accentBlock} ${styles.accentAlt}`}>
                    <div className={styles.accentIcon}>🎨</div>
                    <h3>Custom Orders</h3>
                    <p>Personalized art</p>
                    <Link href="/custom">Get Started →</Link>
                </div>
            </div>
        </section>
    )
}
