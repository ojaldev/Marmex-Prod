'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import styles from '../auth.module.css'

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [message, setMessage] = useState({ type: '', text: '' })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setMessage({
                type: 'error',
                text: 'Invalid reset link. Please request a new password reset.'
            })
        }
    }, [token])

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' })
            return
        }

        if (formData.password.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
            return
        }

        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password: formData.password
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            setSuccess(true)
            setMessage({ type: 'success', text: data.message })

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/auth/login')
            }, 3000)

        } catch (error) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className={styles.authPage}>
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.successIcon}>
                            <CheckCircle size={64} />
                        </div>
                        <h1>Password Reset Successful!</h1>
                        <p className={styles.subtitle}>
                            Your password has been reset successfully. Redirecting to login...
                        </p>
                        <Link href="/auth/login" className="btn btn-primary">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <h1>Reset Password</h1>
                    <p className={styles.subtitle}>
                        Enter your new password below
                    </p>

                    {message.text && (
                        <div className={`${styles.message} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}

                    {!token ? (
                        <Link href="/auth/forgot-password" className="btn btn-primary">
                            Request New Reset Link
                        </Link>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>New Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Minimum 8 characters"
                                    disabled={loading}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Confirm Password *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Re-enter password"
                                    disabled={loading}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <Link href="/auth/login" className={styles.switchLink}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
