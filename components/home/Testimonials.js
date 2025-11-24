'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import styles from './Testimonials.module.css'

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTestimonials()
    }, [])

    const loadTestimonials = async () => {
        try {
            const res = await fetch('/api/testimonials')
            const data = await res.json()
            setTestimonials(data)
        } catch (error) {
            console.error('Failed to load testimonials:', error)
        } finally {
            setLoading(false)
        }
    }

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (testimonials.length === 0) return

        const interval = setInterval(nextTestimonial, 5000)
        return () => clearInterval(interval)
    }, [testimonials.length])

    if (loading) {
        return (
            <section className={styles.testimonials}>
                <div className="container">
                    <div className={styles.loading}>Loading testimonials...</div>
                </div>
            </section>
        )
    }

    if (testimonials.length === 0) {
        return null
    }

    const current = testimonials[currentIndex]

    return (
        <section className={styles.testimonials}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className="section-title">What Our Customers Say</h2>
                    <p className={styles.subtitle}>Trusted by thousands of satisfied customers</p>
                </div>

                <div className={styles.carouselWrapper}>
                    {/* Main Testimonial Card */}
                    <div className={styles.mainCard}>
                        <div className={styles.quoteIcon}>
                            <Quote size={48} />
                        </div>

                        <div className={styles.rating}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={20}
                                    fill={i < (current.rating || 5) ? 'currentColor' : 'none'}
                                    className={styles.star}
                                />
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
                    </div>

                    {/* Navigation */}
                    <div className={styles.navigation}>
                        <button
                            onClick={prevTestimonial}
                            className={styles.navBtn}
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className={styles.indicators}>
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextTestimonial}
                            className={styles.navBtn}
                            aria-label="Next testimonial"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Thumbnail Preview */}
                    {testimonials.length > 1 && (
                        <div className={styles.thumbnails}>
                            {testimonials.map((testimonial, index) => {
                                const offset = index - currentIndex
                                const isVisible = Math.abs(offset) <= 1

                                if (!isVisible) return null

                                return (
                                    <div
                                        key={index}
                                        className={`${styles.thumbnail} ${index === currentIndex ? styles.thumbnailActive : ''}`}
                                        onClick={() => setCurrentIndex(index)}
                                        style={{
                                            transform: `translateX(${offset * 110}%) scale(${index === currentIndex ? 1 : 0.85})`,
                                            opacity: index === currentIndex ? 1 : 0.5
                                        }}
                                    >
                                        <p className={styles.thumbnailName}>{testimonial.customerName}</p>
                                        <div className={styles.thumbnailRating}>
                                            {'★'.repeat(testimonial.rating || 5)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
