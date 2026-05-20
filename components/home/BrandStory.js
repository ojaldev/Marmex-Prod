'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp, slideInLeft, slideInRight, staggerContainer, useCountUp } from '@/lib/animations'
import styles from './BrandStory.module.css'

function StatCounter({ end, label, suffix = '' }) {
    const { count, ref } = useCountUp(end, 2500)
    return (
        <motion.div className={styles.feature} ref={ref} variants={fadeInUp}>
            <h3>{count.toLocaleString()}{suffix}</h3>
            <p>{label}</p>
        </motion.div>
    )
}

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
                    <motion.div
                        className={styles.imageCol}
                        variants={slideInLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                    >
                        <div className={styles.imageWrapper}>
                            <motion.div
                                className={styles.image}
                                style={{ backgroundImage: `url(${config.brandStory?.image})` }}
                                whileHover={{ scale: 1.03 }}
                                transition={{ duration: 0.6 }}
                            />
                            <div className={styles.imageBorder} />
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.contentCol}
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                    >
                        <motion.h2 className={styles.title} variants={fadeInUp}>
                            {config.brandStory?.title || 'Our Story'}
                        </motion.h2>
                        <motion.div className={styles.divider} variants={fadeInUp} />
                        <motion.p className={styles.content} variants={fadeInUp}>
                            {config.brandStory?.content || 'Crafting timeless marble art since generations.'}
                        </motion.p>
                        <motion.div className={styles.features} variants={staggerContainer}>
                            <StatCounter end={100} label="Handcrafted" suffix="%" />
                            <StatCounter end={20} label="Years Experience" suffix="+" />
                            <StatCounter end={5000} label="Happy Customers" suffix="+" />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
