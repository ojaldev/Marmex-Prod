'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'
import styles from './Testimonials.module.css'

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [direction, setDirection] = useState(1)

    useEffect(() => {
        loadTestimonials()
    }, [])

    const FALLBACK_TESTIMONIALS = [
        {
            _id: '1',
            customerName: 'Priya Sharma',
            location: 'Mumbai, Maharashtra',
            rating: 5,
            content: 'The marble Ganesha statue exceeded all expectations. The craftsmanship is exquisite — you can see the passion in every detail. It has become the centerpiece of our home.',
            productReference: 'Divine Ganesha Marble Sculpture'
        },
        {
            _id: '2',
            customerName: 'Rahul Mehta',
            location: 'Delhi, NCR',
            rating: 5,
            content: 'Ordered a custom marble chess set as a gift for my father. The quality is unmatched and the packaging was luxurious. He was absolutely thrilled!',
            productReference: 'Royal Marble Chess Set'
        },
        {
            _id: '3',
            customerName: 'Ananya Patel',
            location: 'Bangalore, Karnataka',
            rating: 5,
            content: 'Beautiful dining decor pieces that transformed our space. The marble coasters and serving tray are both functional and stunning. Highly recommend!',
            productReference: 'Marble Dining Decor Collection'
        },
        {
            _id: '4',
            customerName: 'Vikram Reddy',
            location: 'Hyderabad, Telangana',
            rating: 5,
            content: 'The personalised marble plaque for our anniversary was perfect. The engraving was precise and the stone quality is premium. Will definitely order again.',
            productReference: 'Personalised Marble Plaque'
        },
        {
            _id: '5',
            customerName: 'Sneha Gupta',
            location: 'Pune, Maharashtra',
            rating: 5,
            content: 'Fast shipping and exceptional quality. The marble pooja thali is absolutely gorgeous — even better than the photos. A true work of art.',
            productReference: 'Traditional Marble Pooja Thali'
        }
    ]

    const loadTestimonials = async () => {
        try {
            const res = await fetch('/api/testimonials')
            const data = await res.json()
            setTestimonials(data?.length > 0 ? data : FALLBACK_TESTIMONIALS)
        } catch (error) {
            console.error('Failed to load testimonials:', error)
            setTestimonials(FALLBACK_TESTIMONIALS)
        } finally {
            setLoading(false)
        }
    }

    const nextTestimonial = useCallback(() => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, [testimonials.length])

    const prevTestimonial = useCallback(() => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }, [testimonials.length])

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (testimonials.length === 0) return
        const interval = setInterval(nextTestimonial, 5000)
        return () => clearInterval(interval)
    }, [testimonials.length, nextTestimonial])

    if (loading) {
        return (
            <section className={styles.testimonials}>
                <div className="container">
                    <div className="section-title">What Our Customers Say</div>
                    <div className={styles.loadingSkeleton}>
                        <div className="shimmer w-full h-80 rounded-2xl" />
                    </div>
                </div>
            </section>
        )
    }

    if (testimonials.length === 0) return null

    const current = testimonials[currentIndex]

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            x: direction > 0 ? -100 : 100,
            opacity: 0,
        }),
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
                    <p className={styles.subtitle}>Trusted by thousands of satisfied customers</p>
                </motion.div>

                <div className={styles.carouselWrapper}>
                    {/* Main Testimonial Card */}
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
                                    &quot;{current.content}&quot;
                                </blockquote>

                                <div className={styles.author}>
                                    <div className={styles.authorInfo}>
                                        <p className={styles.authorName}>{current.customerName}</p>
                                        {current.location && (
                                            <p className={styles.authorLocation}>{current.location}</p>
                                        )}
                                    </div>
                                </div>

                                {current.productReference && (
                                    <p className={styles.productRef}>
                                        Purchased: {current.productReference}
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
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
