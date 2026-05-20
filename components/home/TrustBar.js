'use client'

import { motion } from 'framer-motion'
import { Star, Truck, Shield, RefreshCw } from 'lucide-react'
import { fadeInUp, staggerContainer, useCountUp } from '@/lib/animations'
import styles from './TrustBar.module.css'

function AnimatedStat({ end, suffix = '' }) {
    const { count, ref } = useCountUp(end, 2000)
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function TrustBar() {
    const features = [
        {
            icon: Star,
            text: '5000+ Happy Customers',
            subtext: '4.8★ Rating',
            stat: 5000,
        },
        {
            icon: Truck,
            text: 'Free Shipping',
            subtext: 'On orders above ₹2,999',
        },
        {
            icon: Shield,
            text: 'Secure Payment',
            subtext: '100% Safe & Encrypted',
        },
        {
            icon: RefreshCw,
            text: '30-Day Returns',
            subtext: 'Hassle-free refunds',
        },
    ]

    return (
        <section className={styles.trustBar}>
            <div className="container">
                <motion.div
                    className={styles.features}
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className={styles.feature}
                            variants={fadeInUp}
                            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                        >
                            <motion.div
                                className={styles.iconWrapper}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <feature.icon size={24} className={styles.icon} />
                            </motion.div>
                            <div className={styles.content}>
                                <p className={styles.text}>{feature.text}</p>
                                <p className={styles.subtext}>{feature.subtext}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
