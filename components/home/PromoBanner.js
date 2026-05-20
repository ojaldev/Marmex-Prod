'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import styles from './PromoBanner.module.css'

export default function PromoBanner() {
    return (
        <section className={styles.section}>
            <div className="container">
                <motion.div
                    className={styles.banner}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
                >
                    <div className={styles.bannerInner}>
                        <motion.div
                            className={styles.content}
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <motion.div className={styles.badge} variants={fadeInUp}>
                                <Sparkles size={16} />
                                Limited Time Offer
                            </motion.div>
                            <motion.h2 className={styles.title} variants={fadeInUp}>
                                Craft Your Legacy<br />
                                <span>With Custom Marble Art</span>
                            </motion.h2>
                            <motion.p className={styles.description} variants={fadeInUp}>
                                Personalize every detail — from size and stone to intricate engravings. 
                                Our master artisans bring your vision to life.
                            </motion.p>
                            <motion.div variants={fadeInUp}>
                                <Link href="/custom" className={styles.cta}>
                                    Start Your Custom Order
                                    <ArrowRight size={18} />
                                </Link>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className={styles.visual}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className={styles.glow} />
                            <div className={styles.floatingCard}>
                                <div className={styles.cardIcon}>✦</div>
                                <div>
                                    <div className={styles.cardValue}>100%</div>
                                    <div className={styles.cardLabel}>Handcrafted</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
