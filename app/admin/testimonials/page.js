'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Star } from 'lucide-react'
import styles from '../products/products.module.css'

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        customerName: '',
        reviewText: '',
        rating: 5,
        imageUrl: '',
        videoUrl: ''
    })

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    rating: parseInt(formData.rating)
                })
            })

            if (res.ok) {
                loadTestimonials()
                setShowForm(false)
                setFormData({
                    customerName: '',
                    reviewText: '',
                    rating: 5,
                    imageUrl: '',
                    videoUrl: ''
                })
            }
        } catch (error) {
            console.error('Failed to create testimonial:', error)
        }
    }

    const deleteTestimonial = async (id) => {
        if (!confirm('Delete this testimonial?')) return

        try {
            const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
            if (res.ok) loadTestimonials()
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1>Testimonials</h1>
                    <p>Manage customer reviews and feedback</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <Plus size={18} />
                    {showForm ? 'Cancel' : 'Add Testimonial'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Add New Testimonial</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Customer Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.customerName}
                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                    placeholder="John Doe"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Review Text *</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.reviewText}
                                    onChange={e => setFormData({ ...formData, reviewText: e.target.value })}
                                    placeholder="Share your experience..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Rating</label>
                                <select
                                    value={formData.rating}
                                    onChange={e => setFormData({ ...formData, rating: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                >
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Image URL (Google Drive)</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://drive.google.com/file/d/..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Video Review URL (YouTube/Instagram)</label>
                                <input
                                    type="url"
                                    value={formData.videoUrl}
                                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Testimonial</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>Loading testimonials...</div>
            ) : testimonials.length === 0 ? (
                <div className={styles.empty}>
                    <Star size={64} color="var(--color-text-light)" />
                    <h3>No testimonials yet</h3>
                    <p>Add your first customer review</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    {testimonials.map(testimonial => (
                        <div key={testimonial.id} className="card" style={{ padding: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{testimonial.customerName}</h3>
                                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < testimonial.rating ? 'var(--color-secondary)' : 'none'}
                                                color="var(--color-secondary)"
                                            />
                                        ))}
                                    </div>
                                    <p style={{ color: 'var(--color-text-gray)', marginBottom: '0.5rem' }}>{testimonial.reviewText}</p>
                                    {testimonial.imageUrl && (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>📷 Has image</span>
                                    )}
                                    {testimonial.videoUrl && (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginLeft: '1rem' }}>🎥 Has video</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteTestimonial(testimonial.id)}
                                    className={styles.actionBtn}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
