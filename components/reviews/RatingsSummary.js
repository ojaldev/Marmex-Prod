'use client'

import { Star } from 'lucide-react'
import styles from './RatingsSummary.module.css'

export default function RatingsSummary({ summary }) {
    if (!summary || summary.total === 0) {
        return (
            <div className={styles.ratingsSummary}>
                <p className={styles.noReviews}>No reviews yet</p>
                <p className={styles.encouragement}>Be the first to review this product!</p>
            </div>
        )
    }

    const { average, total, distribution } = summary

    return (
        <div className={styles.ratingsSummary}>
            <div className={styles.overallRating}>
                <div className={styles.ratingNumber}>{average.toFixed(1)}</div>
                <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={20}
                            fill={average >= star ? '#D4A574' : 'none'}
                            stroke={average >= star ? '#D4A574' : '#ccc'}
                        />
                    ))}
                </div>
                <div className={styles.totalReviews}>
                    Based on {total} {total === 1 ? 'review' : 'reviews'}
                </div>
            </div>

            <div className={styles.distribution}>
                {[5, 4, 3, 2, 1].map((rating) => {
                    const count = distribution[rating] || 0
                    const percentage = total > 0 ? (count / total) * 100 : 0

                    return (
                        <div key={rating} className={styles.distributionRow}>
                            <div className={styles.ratingLabel}>
                                {rating} <Star size={14} fill="#D4A574" stroke="#D4A574" />
                            </div>
                            <div className={styles.barContainer}>
                                <div
                                    className={styles.bar}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className={styles.count}>{count}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
