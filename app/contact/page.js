'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Instagram, Youtube, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import styles from './contact.module.css'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState('idle') // idle | loading | success | error
    const [statusMessage, setStatusMessage] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear field error when user types
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
        if (!formData.subject.trim() || formData.subject.trim().length < 3) {
            newErrors.subject = 'Subject must be at least 3 characters'
        }
        if (!formData.message.trim() || formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters'
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
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    subject: formData.subject.trim(),
                    message: formData.message.trim()
                })
            })

            const data = await res.json()

            if (res.ok) {
                setStatus('success')
                setStatusMessage(data.message || 'Your message has been sent successfully!')
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
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
        errors[field] ? `${styles.input} ${styles.inputError}` : styles.input

    return (
        <main className={styles.contactPage}>
            <div className={styles.hero}>
                <div className="container">
                    <h1>Get In Touch</h1>
                    <p>We&apos;d love to hear from you about your stone art needs</p>
                </div>
            </div>

            <div className="container section">
                <div className={styles.layout}>
                    <div className={styles.contactInfo}>
                        <h2>Contact Information</h2>
                        <p className={styles.intro}>
                            Have a question or want to discuss a custom project? Reach out to us through any of the channels below.
                        </p>

                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <Phone size={24} color="var(--color-secondary)" />
                                <div>
                                    <h4>Phone</h4>
                                    <p>+91 95821 34493</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <Mail size={24} color="var(--color-secondary)" />
                                <div>
                                    <h4>Email</h4>
                                    <p>Marmexindia@gmail.com</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <MapPin size={24} color="var(--color-secondary)" />
                                <div>
                                    <h4>Location</h4>
                                    <p>Noida, India</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.social}>
                            <h4>Follow Us</h4>
                            <div className={styles.socialLinks}>
                                <a href="https://instagram.com/marmexindia" target="_blank" rel="noopener" className={styles.socialBtn}>
                                    <Instagram size={20} />
                                    Instagram
                                </a>
                                <a href="https://youtube.com/@stoneartwala" target="_blank" rel="noopener" className={styles.socialBtn}>
                                    <Youtube size={20} />
                                    YouTube
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formContainer}>
                        <h2>Send Us a Message</h2>

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
                            <div className={styles.formGrid}>
                                <div className={styles.field}>
                                    <label htmlFor="name">Your Name *</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className={inputClass('name')}
                                        disabled={status === 'loading'}
                                    />
                                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className={inputClass('email')}
                                        disabled={status === 'loading'}
                                    />
                                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 95821 34493"
                                        className={styles.input}
                                        disabled={status === 'loading'}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="subject">Subject *</label>
                                    <input
                                        id="subject"
                                        name="subject"
                                        type="text"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Product Inquiry"
                                        className={inputClass('subject')}
                                        disabled={status === 'loading'}
                                    />
                                    {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Tell us about your requirements..."
                                    className={inputClass('message')}
                                    disabled={status === 'loading'}
                                />
                                {errors.message && <span className={styles.errorText}>{errors.message}</span>}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 size={18} className={styles.spin} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className={styles.bulkOrder}>
                    <h2>Bulk Orders & Custom Projects</h2>
                    <p>
                        Looking for bulk orders or custom marble installations? We specialize in large-scale projects
                        for hotels, restaurants, residential complexes, and commercial spaces. Contact us for a personalized quote.
                    </p>
                    <a href="mailto:Marmexindia@gmail.com" className="btn btn-secondary">Request Bulk Quote</a>
                </div>
            </div>
        </main>
    )
}
