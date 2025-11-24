'use client'

import { useEffect, useState } from 'react'
import styles from './BrandStory.module.css'

export default function BrandStory() {
    const [config, setConfig] = useState(null)

    useEffect(() => {
        fetch('/api/site-config')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error('Failed to load config:', err))
    }, [])

    if (!config) return null

    return (
        <section className={`section ${styles.brandStory}`}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.imageCol}>
                        <div className={styles.imageWrapper}>
                            <div className={styles.image} style={{ backgroundImage: `url(${config.brandStory.image})` }} />
                            <div className={styles.imageBorder} />
                        </div>
                    </div>

                    <div className={styles.contentCol}>
                        <h2 className={styles.title}>{config.brandStory.title}</h2>
                        <div className={styles.divider} />
                        <p className={styles.content}>{config.brandStory.content}</p>
                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <h3>100%</h3>
                                <p>Handcrafted</p>
                            </div>
                            <div className={styles.feature}>
                                <h3>20+</h3>
                                <p>Years Experience</p>
                            </div>
                            <div className={styles.feature}>
                                <h3>5000+</h3>
                                <p>Happy Customers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
