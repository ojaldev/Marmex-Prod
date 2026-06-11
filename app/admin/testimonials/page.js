'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Star, BadgeCheck } from 'lucide-react'
import styles from '../products/products.module.css'

const EMPTY_FORM = {
    customerName: '',
    location: '',
    reviewText: '',
    rating: 5,
    imageUrl: '',
    videoUrl: '',
    productReference: '',
    verified: false,
    featured: false,
}

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState(EMPTY_FORM)

    useEffect(() => {
        loadTestimonials()
    }, [])

    const loadTestimonials = async () => {
        try {
            const res = await fetch('/api/testimonials')
            const data = await res.json()
            setTestimonials(Array.isArray(data) ? data : [])
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
                body: JSON.stringify({ ...formData, rating: parseInt(formData.rating) })
            })
            if (res.ok) {
                loadTestimonials()
                setShowForm(false)
                setFormData(EMPTY_FORM)
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

    const field = (label, key, type = 'text', placeholder = '') => (
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{label}</label>
            <input
                type={type}
                value={formData[key]}
                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                placeholder={placeholder}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
            />
        </div>
    )

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
                            {field('Customer Name *', 'customerName', 'text', 'e.g. Priya Sharma')}
                            {field('Location', 'location', 'text', 'e.g. Mumbai, Maharashtra')}

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Review *</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.reviewText}
                                    onChange={e => setFormData({ ...formData, reviewText: e.target.value })}
                                    placeholder="Share the customer's experience..."
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
                                    {[5, 4, 3, 2, 1].map(n => (
                                        <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            {field('Product / Item Purchased', 'productReference', 'text', 'e.g. Marble Ganesha Statue')}
                            {field('Customer Photo URL (optional)', 'imageUrl', 'url', 'https://...')}
                            {field('Video Review URL (optional)', 'videoUrl', 'url', 'https://youtube.com/...')}

                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.verified}
                                        onChange={e => setFormData({ ...formData, verified: e.target.checked })}
                                    />
                                    Verified Purchase
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                    />
                                    Featured (show first)
                                </label>
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
                    <p>Add your first customer review to display it on the homepage</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    {testimonials.map(t => (
                        <div key={t._id} className="card" style={{ padding: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0 }}>{t.customerName}</h3>
                                        {t.verified && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>
                                                <BadgeCheck size={14} /> Verified
                                            </span>
                                        )}
                                        {t.featured && (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600 }}>⭐ Featured</span>
                                        )}
                                    </div>
                                    {t.location && (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: '0 0 0.5rem' }}>{t.location}</p>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < t.rating ? 'var(--color-secondary)' : 'none'}
                                                color="var(--color-secondary)"
                                            />
                                        ))}
                                    </div>
                                    <p style={{ color: 'var(--color-text-gray)', margin: '0 0 0.5rem' }}>{t.reviewText}</p>
                                    {t.productReference && (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0, fontStyle: 'italic' }}>
                                            Purchased: {t.productReference}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteTestimonial(t._id)}
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
