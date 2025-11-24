'use client'

import { useState, useEffect } from 'react'
import { Star, Check, X, Eye } from 'lucide-react'
import styles from './reviews.module.css'

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([])
    const [filter, setFilter] = useState('pending')
    const [loading, setLoading] = useState(true)
    const [selectedReview, setSelectedReview] = useState(null)

    useEffect(() => {
        fetchReviews()
    }, [filter])

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/admin/reviews?status=${filter}`)
            const data = await res.json()
            setReviews(data.reviews || [])
        } catch (error) {
            console.error('Failed to fetch reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (reviewId) => {
        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            })

            if (res.ok) {
                fetchReviews()
            }
        } catch (error) {
            alert('Failed to approve review')
        }
    }

    const handleReject = async (reviewId) => {
        if (!confirm('Are you sure you want to reject this review?')) return

        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' })
            })

            if (res.ok) {
                fetchReviews()
            }
        } catch (error) {
            alert('Failed to reject review')
        }
    }

    const handleDelete = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return

        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchReviews()
            }
        } catch (error) {
            alert('Failed to delete review')
        }
    }

    if (loading) {
        return <div className={styles.loading}>Loading reviews...</div>
    }

    return (
        <div className={styles.reviewsPage}>
            <div className={styles.header}>
                <h1>Review Moderation</h1>
                <div className={styles.stats}>
                    <span>Total: {reviews.length}</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
                {['pending', 'approved', 'rejected'].map(status => (
                    <button
                        key={status}
                        className={filter === status ? styles.active : ''}
                        onClick={() => setFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className={styles.empty}>
                    <p>No {filter} reviews found</p>
                </div>
            ) : (
                <div className={styles.reviewsList}>
                    {reviews.map(review => (
                        <div key={review._id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.userInfo}>
                                    <strong>{review.user?.name || 'Unknown User'}</strong>
                                    <span className={styles.email}>{review.user?.email}</span>
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

                            <div className={styles.reviewContent}>
                                <h3>{review.title}</h3>
                                <p>{review.content}</p>

                                {/* Media Gallery */}
                                {review.media && review.media.length > 0 && (
                                    <div className={styles.mediaGallery}>
                                        {review.media.map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt={`Review media ${index + 1}`}
                                                onClick={() => window.open(url, '_blank')}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.reviewMeta}>
                                <span>Product ID: {review.product}</span>
                                <span>Submitted: {new Date(review.createdAt).toLocaleDateString()}</span>
                                <span className={`${styles.statusBadge} ${styles[review.status]}`}>
                                    {review.status}
                                </span>
                            </div>

                            <div className={styles.actions}>
                                {review.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(review._id)}
                                            className={styles.approveBtn}
                                        >
                                            <Check size={16} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(review._id)}
                                            className={styles.rejectBtn}
                                        >
                                            <X size={16} />
                                            Reject
                                        </button>
                                    </>
                                )}
                                {review.status === 'approved' && (
                                    <button
                                        onClick={() => handleReject(review._id)}
                                        className={styles.rejectBtn}
                                    >
                                        <X size={16} />
                                        Unpublish
                                    </button>
                                )}
                                {review.status === 'rejected' && (
                                    <button
                                        onClick={() => handleApprove(review._id)}
                                        className={styles.approveBtn}
                                    >
                                        <Check size={16} />
                                        Approve
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(review._id)}
                                    className={styles.deleteBtn}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
