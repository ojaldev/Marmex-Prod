'use client'

import { useState } from 'react'
import { Tag, X, Check } from 'lucide-react'
import styles from './PromoCodeInput.module.css'

export default function PromoCodeInput({ orderTotal, onApply, onRemove, appliedPromo }) {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleApply = async () => {
        if (!code.trim()) {
            setError('Please enter a promo code')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/promo/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code.trim(),
                    orderTotal
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Invalid promo code')
            }

            onApply(data.promoCode)
            setCode('')
            setError('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = () => {
        setCode('')
        setError('')
        onRemove()
    }

    if (appliedPromo) {
        return (
            <div className={styles.appliedPromo}>
                <div className={styles.promoInfo}>
                    <Check size={20} className={styles.checkIcon} />
                    <div>
                        <strong>{appliedPromo.code}</strong>
                        <span className={styles.discount}>
                            -₹{appliedPromo.discount.toLocaleString()} off
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleRemove}
                    className={styles.removeBtn}
                    type="button"
                >
                    <X size={18} />
                </button>
            </div>
        )
    }

    return (
        <div className={styles.promoInput}>
            <div className={styles.inputWrapper}>
                <Tag size={20} className={styles.icon} />
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className={styles.input}
                />
                <button
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                    className={styles.applyBtn}
                    type="button"
                >
                    {loading ? 'Checking...' : 'Apply'}
                </button>
            </div>
            {error && <div className={styles.error}>{error}</div>}
        </div>
    )
}
