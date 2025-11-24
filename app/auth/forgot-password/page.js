'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import styles from '../auth.module.css'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState({ type: '', text: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            setMessage({
                type: 'success',
                text: data.message
            })
            setEmail('')

        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <h1>Forgot Password</h1>
                    <p className={styles.subtitle}>
                        Enter your email address and we&apos;ll send you a link to reset your password
                    </p>

                    {message.text && (
                        <div className={`${styles.message} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <Link href="/auth/login" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
