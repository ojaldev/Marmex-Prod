'use client'

import { useEffect, useState } from 'react'
import { Percent, Save, CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function SettingsPage() {
    const [config, setConfig] = useState(null)
    const [gstRate, setGstRate] = useState('')
    const [saving, setSaving] = useState(false)
    const [feedback, setFeedback] = useState(null) // { type: 'success'|'error', message }

    useEffect(() => {
        fetch('/api/site-config')
            .then(r => r.json())
            .then(data => {
                setConfig(data)
                setGstRate(String(data?.pricing?.gstRate ?? 18))
            })
            .catch(() => setFeedback({ type: 'error', message: 'Failed to load settings.' }))
    }, [])

    const handleSave = async (e) => {
        e.preventDefault()
        const parsed = parseFloat(gstRate)
        if (isNaN(parsed) || parsed < 0 || parsed > 100) {
            setFeedback({ type: 'error', message: 'GST rate must be a number between 0 and 100.' })
            return
        }

        setSaving(true)
        setFeedback(null)
        try {
            const res = await fetch('/api/site-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pricing: { gstRate: parsed } })
            })
            if (!res.ok) throw new Error()
            const updated = await res.json()
            setConfig(updated)
            setGstRate(String(updated.pricing?.gstRate ?? parsed))
            setFeedback({ type: 'success', message: `GST rate updated to ${parsed}%. All new orders and carts will use this rate.` })
        } catch {
            setFeedback({ type: 'error', message: 'Failed to save settings. Please try again.' })
        } finally {
            setSaving(false)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        fontSize: '1rem',
        outline: 'none',
    }

    const labelStyle = {
        display: 'block',
        fontWeight: 600,
        marginBottom: '0.4rem',
        fontSize: '0.9rem',
    }

    return (
        <div style={{ maxWidth: 680 }}>
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ margin: 0 }}>Settings</h1>
                <p style={{ color: 'var(--color-text-gray)', marginTop: '0.25rem' }}>
                    Configure tax rates and system-wide pricing rules.
                </p>
            </div>

            {/* Tax & Pricing Card */}
            <div className="card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: 'rgba(212,165,116,0.12)', border: '1px solid rgba(212,165,116,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-secondary)', flexShrink: 0
                    }}>
                        <Percent size={18} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Tax &amp; Pricing</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-gray)' }}>
                            Applied to all orders at checkout
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={labelStyle} htmlFor="gstRate">GST Rate (%)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                id="gstRate"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={gstRate}
                                onChange={e => setGstRate(e.target.value)}
                                style={{ ...inputStyle, paddingRight: '3rem' }}
                                placeholder="18"
                                disabled={!config}
                            />
                            <span style={{
                                position: 'absolute', right: '1rem',
                                color: 'var(--color-text-gray)', fontWeight: 700, pointerEvents: 'none'
                            }}>%</span>
                        </div>
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-gray)', display: 'flex', gap: '0.3rem', alignItems: 'flex-start' }}>
                            <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                            This rate is applied to the taxable amount (subtotal − discount + shipping). Set to 0 to disable GST.
                        </p>
                    </div>

                    {/* Live preview */}
                    {gstRate !== '' && !isNaN(parseFloat(gstRate)) && (
                        <div style={{
                            background: 'var(--color-pearl)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 8,
                            padding: '0.875rem 1rem',
                            marginBottom: 'var(--spacing-lg)',
                            fontSize: '0.875rem',
                        }}>
                            <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.4rem' }}>Preview — ₹1,000 order</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-gray)' }}>
                                <span>Subtotal</span><span>₹1,000</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-gray)' }}>
                                <span>GST ({parseFloat(gstRate)}%)</span>
                                <span>₹{(1000 * parseFloat(gstRate) / 100).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--color-border)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                                <span>Total</span>
                                <span>₹{(1000 + 1000 * parseFloat(gstRate) / 100).toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {feedback && (
                        <div style={{
                            display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                            padding: '0.75rem 1rem',
                            borderRadius: 8,
                            marginBottom: 'var(--spacing-md)',
                            background: feedback.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                            border: `1px solid ${feedback.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                            color: feedback.type === 'success' ? '#15803d' : '#dc2626',
                            fontSize: '0.875rem',
                        }}>
                            {feedback.type === 'success'
                                ? <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                                : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                            }
                            {feedback.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving || !config}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <Save size={16} />
                        {saving ? 'Saving…' : 'Save Settings'}
                    </button>
                </form>
            </div>

            {/* Info card */}
            <div className="card" style={{ padding: 'var(--spacing-lg)', background: 'var(--color-pearl)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.95rem' }}>Where this rate is applied</h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--color-text-gray)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                    <li>Cart page — tax line item and grand total</li>
                    <li>Checkout page — order summary before payment</li>
                    <li>Order confirmation emails — tax label shows current rate</li>
                    <li>PDF invoices — GST breakdown (CGST + SGST)</li>
                    <li>Server-side order validation — the server re-reads this rate when creating every order</li>
                </ul>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    Existing orders are not affected — they store the rate at the time of purchase.
                </p>
            </div>
        </div>
    )
}
