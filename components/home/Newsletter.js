'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import styles from './Newsletter.module.css'

export default function Newsletter() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email.trim()) return

        setStatus('loading')
        // Simulate API call - in production, connect to your backend
        setTimeout(() => {
            setStatus('success')
            setEmail('')
        }, 1500)
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <motion.div
                    className={styles.wrapper}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.div className={styles.iconWrapper} variants={fadeInUp}>
                            <Mail size={32} />
                        </motion.div>
                        <motion.div className={styles.badge} variants={fadeInUp}>
                            🎁 Get 10% off your first order
                        </motion.div>
                        <motion.h2 className={styles.title} variants={fadeInUp}>
                            Join Our Inner Circle
                        </motion.h2>
                        <motion.p className={styles.description} variants={fadeInUp}>
                            Subscribe for exclusive early access to new collections, artisan stories,
                            and a <strong>10% discount</strong> on your first purchase. No spam, only beauty.
                        </motion.p>

                        <motion.form
                            onSubmit={handleSubmit}
                            className={styles.form}
                            variants={fadeInUp}
                        >
                            <div className={styles.inputWrapper}>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (status === 'success' || status === 'error') setStatus('idle')
                                    }}
                                    className={styles.input}
                                    disabled={status === 'loading'}
                                    required
                                />
                                <motion.button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={status === 'loading'}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {status === 'loading' ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : status === 'success' ? (
                                        <Check size={20} />
                                    ) : (
                                        <ArrowRight size={20} />
                                    )}
                                </motion.button>
                            </div>

                            {status === 'success' && (
                                <motion.p
                                    className={styles.successMessage}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    🎉 Welcome! Your 10% off code is on its way to your inbox.
                                </motion.p>
                            )}
                        </motion.form>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
