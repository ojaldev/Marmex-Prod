'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import styles from './CategoryTiles.module.css'

export default function CategoryTiles() {
    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Failed to load categories:', err))
    }, [])

    return (
        <section className="section">
            <div className="container">
                <h2 className="section-title">Explore Our Collections</h2>

                <div className={styles.grid}>
                    {categories.map((category, index) => (
                        <Link
                            href={`/products?category=${category.slug}`}
                            key={category.id}
                            className={styles.tile}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={styles.tileImage} style={{ backgroundImage: `url(${category.image})` }} />
                            <div className={styles.tileOverlay} />
                            <div className={styles.tileContent}>
                                <h3 className={styles.tileName}>{category.name}</h3>
                                <p className={styles.tileDesc}>{category.description}</p>
                                <span className={styles.tileLink}>
                                    View Collection <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
