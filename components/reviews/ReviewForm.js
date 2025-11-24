'use client'

import { useState } from 'react'
import { Star, Upload, X } from 'lucide-react'
import styles from './ReviewForm.module.css'

export default function ReviewForm({ productId, onSuccess }) {
    const [formData, setFormData] = useState({
        rating: 0,
        title: '',
        content: '',
        media: []
    })
    const [hoverRating, setHoverRating] = useState(0)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [mediaPreviews, setMediaPreviews] = useState([])

    const handleRatingClick = (rating) => {
        setFormData(prev => ({ ...prev, rating }))
    }

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleMediaUpload = async (e) => {
        const files = Array.from(e.target.files)

        if (files.length + mediaPreviews.length > 5) {
            setError('Maximum 5 images/videos allowed')
            return
        }

        setUploading(true)
        setError('')

        try {
            const uploadedUrls = []

            for (const file of files) {
                // Check file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    setError('Files must be less than 10MB')
                    continue
                }

                // Check file type
                if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                    setError('Only images and videos are allowed')
                    continue
                }

                // Convert to base64
                const reader = new FileReader()
                const base64 = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result)
                    reader.readAsDataURL(file)
                })

                // Upload to Cloudinary via API
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file: base64 })
                })

                if (res.ok) {
                    const data = await res.json()
                    uploadedUrls.push(data.url)
                }
            }

            setMediaPreviews(prev => [...prev, ...uploadedUrls])
            setFormData(prev => ({
                ...prev,
                media: [...prev.media, ...uploadedUrls]
            }))
        } catch (err) {
            setError('Failed to upload media')
        } finally {
            setUploading(false)
        }
    }

    const removeMedia = (index) => {
        setMediaPreviews(prev => prev.filter((_, i) => i !== index))
        setFormData(prev => ({
            ...prev,
            media: prev.media.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.rating === 0) {
            setError('Please select a rating')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    ...formData
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit review')
            }

            // Reset form
            setFormData({ rating: 0, title: '', content: '', media: [] })
            setMediaPreviews([])

            if (onSuccess) {
                onSuccess(data.review)
            }

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.reviewForm}>
            <h3>Write a Review</h3>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <div className={styles.formGroup}>
                    <label>Rating *</label>
                    <div className={styles.starRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={styles.starButton}
                                onClick={() => handleRatingClick(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                <Star
                                    size={32}
                                    fill={(hoverRating || formData.rating) >= star ? '#D4A574' : 'none'}
                                    stroke={(hoverRating || formData.rating) >= star ? '#D4A574' : '#ccc'}
                                />
                            </button>
                        ))}
                        <span className={styles.ratingText}>
                            {formData.rating > 0 && `${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <div className={styles.formGroup}>
                    <label>Review Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Summarize your experience"
                        maxLength="100"
                    />
                </div>

                {/* Content */}
                <div className={styles.formGroup}>
                    <label>Your Review *</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        placeholder="Share your thoughts about this product..."
                        rows="6"
                        maxLength="1000"
                    />
                    <small>{formData.content.length}/1000 characters</small>
                </div>

                {/* Media Upload */}
                <div className={styles.formGroup}>
                    <label>Photos/Videos (Optional)</label>
                    <div className={styles.mediaUpload}>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleMediaUpload}
                            disabled={uploading || mediaPreviews.length >= 5}
                            id="media-upload"
                            hidden
                        />
                        <label htmlFor="media-upload" className={styles.uploadButton}>
                            <Upload size={20} />
                            {uploading ? 'Uploading...' : 'Add Photos/Videos'}
                        </label>
                        <small>Up to 5 files, max 10MB each</small>
                    </div>

                    {/* Media Previews */}
                    {mediaPreviews.length > 0 && (
                        <div className={styles.mediaPreviews}>
                            {mediaPreviews.map((url, index) => (
                                <div key={index} className={styles.mediaPreview}>
                                    <img src={url} alt={`Upload ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeMedia(index)}
                                        className={styles.removeMedia}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || uploading}
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    )
}
