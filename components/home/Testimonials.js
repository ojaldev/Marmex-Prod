'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle } from 'lucide-react'
import styles from './Testimonials.module.css'

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [direction, setDirection] = useState(1)

    useEffect(() => {
        fetch('/api/testimonials')
            .then(r => r.json())
            .then(data => setTestimonials(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const nextTestimonial = useCallback(() => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, [testimonials.length])

    const prevTestimonial = useCallback(() => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }, [testimonials.length])

    useEffect(() => {
        if (testimonials.length === 0) return
        const interval = setInterval(nextTestimonial, 5000)
        return () => clearInterval(interval)
    }, [testimonials.length, nextTestimonial])

    if (loading || testimonials.length === 0) return null

    const current = testimonials[currentIndex]

    const initials = (current.customerName || '')
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()

    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
    }

    return (
        <section className={styles.testimonials}>
            <div className="container">
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="section-title">What Our Customers Say</h2>
                    <p className={styles.subtitle}>Trusted by customers across India</p>
                </motion.div>

                <div className={styles.carouselWrapper}>
                    <div className={styles.mainCard}>
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                                className={styles.cardContent}
                            >
                                <div className={styles.quoteIcon}>
                                    <Quote size={48} />
                                </div>

                                <div className={styles.rating}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.08 }}
                                        >
                                            <Star
                                                size={20}
                                                fill={i < (current.rating || 5) ? 'currentColor' : 'none'}
                                                className={styles.star}
                                            />
                                        </motion.div>
                                    ))}
                                </div>

                                <blockquote className={styles.quote}>
                                    &quot;{current.reviewText}&quot;
                                </blockquote>

                                <div className={styles.author}>
                                    {current.imageUrl ? (
                                        <img
                                            src={current.imageUrl}
                                            alt={current.customerName}
                                            className={styles.avatar}
                                        />
                                    ) : (
                                        <div className={styles.avatarInitials}>{initials}</div>
                                    )}
                                    <div className={styles.authorInfo}>
                                        <p className={styles.authorName}>{current.customerName}</p>
                                        {current.location && (
                                            <p className={styles.authorLocation}>{current.location}</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.meta}>
                                    {current.verified && (
                                        <span className={styles.verifiedBadge}>
                                            <CheckCircle size={13} />
                                            Verified Purchase
                                        </span>
                                    )}
                                    {current.productReference && (
                                        <p className={styles.productRef}>
                                            {current.productReference}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className={styles.navigation}>
                        <motion.button
                            onClick={prevTestimonial}
                            className={styles.navBtn}
                            aria-label="Previous testimonial"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChevronLeft size={24} />
                        </motion.button>

                        <div className={styles.indicators}>
                            {testimonials.map((_, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => {
                                        setDirection(index > currentIndex ? 1 : -1)
                                        setCurrentIndex(index)
                                    }}
                                    className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                    whileHover={{ scale: 1.2 }}
                                />
                            ))}
                        </div>

                        <motion.button
                            onClick={nextTestimonial}
                            className={styles.navBtn}
                            aria-label="Next testimonial"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChevronRight size={24} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    )
}
