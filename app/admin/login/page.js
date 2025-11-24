'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'
import styles from './login.module.css'

export default function AdminLoginPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })

            const data = await res.json()

            if (res.ok) {
                router.push('/admin')
                router.refresh()
            } else {
                setError(data.error || 'Invalid password')
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginBox}>
                <div className={styles.header}>
                    <div className={styles.icon}>
                        <Lock size={48} />
                    </div>
                    <h1>Marmex India CMS</h1>
                    <p>Admin Access Required</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>Password</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                required
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.toggleBtn}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                        {loading ? 'Authenticating...' : 'Login'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>Protected by password authentication</p>
                </div>
            </div>
        </div>
    )
}
