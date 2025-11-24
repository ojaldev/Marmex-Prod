'use client'

import { useState } from 'react'
import { Star, ThumbsUp } from 'lucide-react'
import { useSession } from 'next-auth/react'
import styles from './ReviewList.module.css'

export default function ReviewList({ reviews: initialReviews, productId }) {
    const { data: session } = useSession()
    const [reviews, setReviews] = useState(initialReviews || [])
    const [sort, setSort] = useState('newest')
    const [filter, setFilter] = useState('all')

    const handleHelpful = async (reviewId) => {
        if (!session) {
            alert('Please login to mark reviews as helpful')
            return
        }

        try {
            const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
                method: 'POST'
            })

            if (res.ok) {
                const data = await res.json()
                // Update local state
                setReviews(prev => prev.map(r =>
                    r._id === reviewId
                        ? { ...r, helpful: data.isHelpful ? [...(r.helpful || []), session.user.id] : (r.helpful || []).filter(id => id !== session.user.id) }
                        : r
                ))
            }
        } catch (error) {
            console.error('Failed to mark helpful:', error)
        }
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No reviews yet for this product</p>
            </div>
        )
    }

    return (
        <div className={styles.reviewList}>
            {/* Filter/Sort Controls */}
            <div className={styles.controls}>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.sortSelect}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                    <option value="helpful">Most Helpful</option>
                </select>

                <div className={styles.filterButtons}>
                    {['all', 5, 4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            className={filter === rating ? styles.active : ''}
                            onClick={() => setFilter(rating)}
                        >
                            {rating === 'all' ? 'All' : `${rating} ★`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reviews */}
            <div className={styles.reviews}>
                {reviews.map((review) => (
                    <div key={review._id} className={styles.reviewCard}>
                        {/* Header */}
                        <div className={styles.reviewHeader}>
                            <div className={styles.userInfo}>
                                {review.user?.photo ? (
                                    <img src={review.user.photo} alt={review.user.name} className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {review.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className={styles.userName}>{review.user?.name || 'Anonymous'}</div>
                                    <div className={styles.reviewDate}>
                                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.rating}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={16}
                                        fill={review.rating >= star ? '#D4A574' : 'none'}
                                        stroke={review.rating >= star ? '#D4A574' : '#ccc'}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className={styles.reviewContent}>
                            <h4>{review.title}</h4>
                            <p>{review.content}</p>

                            {review.verified && (
                                <span className={styles.verifiedBadge}>✓ Verified Purchase</span>
                            )}
                        </div>

                        {/* Media */}
                        {review.media && review.media.length > 0 && (
                            <div className={styles.reviewMedia}>
                                {review.media.map((url, index) => (
                                    <img key={index} src={url} alt={`Review ${index + 1}`} />
                                ))}
                            </div>
                        )}

                        {/* Footer */}
                        <div className={styles.reviewFooter}>
                            <button
                                onClick={() => handleHelpful(review._id)}
                                className={`${styles.helpfulBtn} ${session && review.helpful?.includes(session.user.id) ? styles.marked : ''}`}
                            >
                                <ThumbsUp size={16} />
                                Helpful ({review.helpful?.length || 0})
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
