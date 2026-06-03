'use client'

import { useState } from 'react'
import { Palette, MessageSquare, CheckCircle, Clock, Sparkles, Send, Loader2, AlertCircle } from 'lucide-react'
import styles from './custom.module.css'

export default function CustomOrdersPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        category: '',
        description: '',
        budget: ''
    })
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState('idle') // idle | loading | success | error
    const [statusMessage, setStatusMessage] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.name.trim() || formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (formData.phone.trim().length < 7) {
            newErrors.phone = 'Phone number is too short'
        }
        if (!formData.category) {
            newErrors.category = 'Please select a category'
        }
        if (!formData.description.trim() || formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setStatus('loading')
        setStatusMessage('')

        try {
            const res = await fetch('/api/custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    category: formData.category,
                    description: formData.description.trim(),
                    budget: formData.budget.trim()
                })
            })

            const data = await res.json()

            if (res.ok) {
                setStatus('success')
                setStatusMessage(data.message || 'Your inquiry has been submitted successfully!')
                setFormData({ name: '', email: '', phone: '', category: '', description: '', budget: '' })
            } else {
                setStatus('error')
                setStatusMessage(data.error || 'Something went wrong. Please try again.')
            }
        } catch {
            setStatus('error')
            setStatusMessage('Network error. Please check your connection and try again.')
        }
    }

    const inputClass = (field) =>
        errors[field] ? `${styles.fieldError}` : ''

    return (
        <main className={styles.customPage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1>Custom Orders</h1>
                        <p className={styles.subtitle}>
                            Bring your vision to life with our bespoke marble craftsmanship
                        </p>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* How It Works */}
                <section className={styles.howItWorks}>
                    <h2>How It Works</h2>
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <MessageSquare size={32} />
                            </div>
                            <h3>1. Share Your Vision</h3>
                            <p>Tell us about your idea, preferences, and requirements through our inquiry form</p>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <Palette size={32} />
                            </div>
                            <h3>2. Design & Quote</h3>
                            <p>Our artisans will create a design mockup and provide you with a detailed quote</p>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <CheckCircle size={32} />
                            </div>
                            <h3>3. Approval</h3>
                            <p>Review and approve the design, make any adjustments needed</p>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <Sparkles size={32} />
                            </div>
                            <h3>4. Crafting</h3>
                            <p>Our master craftsmen bring your design to life with premium marble</p>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <Clock size={32} />
                            </div>
                            <h3>5. Delivery</h3>
                            <p>Your custom piece is carefully packaged and delivered to your doorstep</p>
                        </div>
                    </div>
                </section>

                {/* Popular Custom Items */}
                <section className={styles.popularItems}>
                    <h2>Popular Custom Orders</h2>
                    <div className={styles.itemsGrid}>
                        <div className={styles.item}>
                            <div className={styles.itemImage}>🏆</div>
                            <h3>Corporate Awards</h3>
                            <p>Elegant marble trophies and plaques with custom engraving</p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.itemImage}>🎁</div>
                            <h3>Wedding Gifts</h3>
                            <p>Personalized marble keepsakes for special occasions</p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.itemImage}>🏠</div>
                            <h3>Home Décor</h3>
                            <p>Custom sculptures and art pieces for your space</p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.itemImage}>💍</div>
                            <h3>Jewelry Boxes</h3>
                            <p>Handcrafted marble boxes with intricate designs</p>
                        </div>
                    </div>
                </section>

                {/* Inquiry Form */}
                <section className={styles.inquiryForm}>
                    <div className={styles.formCard}>
                        <h2>Start Your Custom Order</h2>
                        <p>Fill out the form below and we&apos;ll get back to you within 24 hours</p>

                        {status === 'success' && (
                            <div className={styles.statusBox}>
                                <CheckCircle size={20} />
                                <span>{statusMessage}</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className={`${styles.statusBox} ${styles.statusError}`}>
                                <AlertCircle size={20} />
                                <span>{statusMessage}</span>
                            </div>
                        )}

                        <form className={styles.form} onSubmit={handleSubmit} noValidate>
                            <div className={styles.formRow}>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                        className={inputClass('name')}
                                        disabled={status === 'loading'}
                                    />
                                    <label>Your Name *</label>
                                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                </div>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                        className={inputClass('email')}
                                        disabled={status === 'loading'}
                                    />
                                    <label>Email Address *</label>
                                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                        className={inputClass('phone')}
                                        disabled={status === 'loading'}
                                    />
                                    <label>Phone Number *</label>
                                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                </div>
                                <div className={styles.inputWrapper}>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className={inputClass('category')}
                                        disabled={status === 'loading'}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="sculpture">Sculpture</option>
                                        <option value="gift">Gift Item</option>
                                        <option value="decor">Home Décor</option>
                                        <option value="award">Award / Trophy</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <label>Category *</label>
                                    {errors.category && <span className={styles.errorText}>{errors.category}</span>}
                                </div>
                            </div>

                            <div className={styles.inputWrapper}>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="6"
                                    required
                                    placeholder=" "
                                    className={inputClass('description')}
                                    disabled={status === 'loading'}
                                />
                                <label>Describe Your Vision *</label>
                                {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                            </div>

                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    placeholder=" "
                                    disabled={status === 'loading'}
                                />
                                <label>Budget Range (Optional)</label>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 size={18} className={styles.spin} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Inquiry
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className={styles.infoCard}>
                        <h3>Why Choose Custom?</h3>
                        <ul>
                            <li><CheckCircle size={20} /> Unique, one-of-a-kind pieces</li>
                            <li><CheckCircle size={20} /> Premium quality marble</li>
                            <li><CheckCircle size={20} /> Expert craftsmanship</li>
                            <li><CheckCircle size={20} /> Personalized designs</li>
                            <li><CheckCircle size={20} /> Perfect for gifts & awards</li>
                        </ul>

                        <div className={styles.contact}>
                            <h4>Questions?</h4>
                            <p>
                                <strong>Email:</strong> Marmexindia@gmail.com<br />
                                <strong>Phone:</strong> +91 95821 34493<br />
                                <strong>Location:</strong> Noida, India<br />
                                <strong>Hours:</strong> Mon-Sat, 9AM-6PM
                            </p>
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className={styles.timeline}>
                    <h2>Typical Timeline</h2>
                    <div className={styles.timelineContent}>
                        <div className={styles.timelineItem}>
                            <strong>Initial Design:</strong> 3-5 business days
                        </div>
                        <div className={styles.timelineItem}>
                            <strong>Approval & Revisions:</strong> 1-3 business days
                        </div>
                        <div className={styles.timelineItem}>
                            <strong>Production:</strong> 2-4 weeks (depending on complexity)
                        </div>
                        <div className={styles.timelineItem}>
                            <strong>Delivery:</strong> 5-7 business days
                        </div>
                    </div>
                    <p className={styles.timelineNote}>
                        *Timeline may vary based on design complexity and current order volume
                    </p>
                </section>
            </div>
        </main>
    )
}
