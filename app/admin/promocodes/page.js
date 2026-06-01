'use client'

import { useEffect, useState } from 'react'
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, X, Check } from 'lucide-react'
import styles from './promocodes.module.css'

export default function AdminPromoCodesPage() {
    const [promos, setPromos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        code: '', type: 'percentage', value: '', minOrderValue: '',
        maxDiscount: '', validFrom: '', validUntil: '',
        usageLimit: '', active: true, description: ''
    })
    const [submitting, setSubmitting] = useState(false)

    const fetchPromos = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/promocodes')
            const data = await res.json()
            if (res.ok) setPromos(data.promos || [])
        } catch (err) {
            console.error('Fetch promos error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPromos()
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch('/api/admin/promocodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    value: Number(formData.value),
                    minOrderValue: Number(formData.minOrderValue) || 0,
                    maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
                    usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
                })
            })
            if (res.ok) {
                setShowForm(false)
                setFormData({
                    code: '', type: 'percentage', value: '', minOrderValue: '',
                    maxDiscount: '', validFrom: '', validUntil: '',
                    usageLimit: '', active: true, description: ''
                })
                fetchPromos()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to create')
            }
        } catch (err) {
            alert('Error creating promo code')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleActive = async (promo) => {
        try {
            const res = await fetch(`/api/admin/promocodes/${promo._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !promo.active })
            })
            if (res.ok) fetchPromos()
        } catch (err) {
            console.error('Toggle error:', err)
        }
    }

    const deletePromo = async (id) => {
        if (!confirm('Delete this promo code?')) return
        try {
            const res = await fetch(`/api/admin/promocodes/${id}`, { method: 'DELETE' })
            if (res.ok) fetchPromos()
        } catch (err) {
            console.error('Delete error:', err)
        }
    }

    const formatDate = (d) => {
        if (!d) return '-'
        return new Date(d).toLocaleDateString('en-IN')
    }

    const isExpired = (validUntil) => {
        return new Date(validUntil) < new Date()
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Promo Codes</h1>
                <p>Create and manage discount coupons</p>
                <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? 'Cancel' : 'New Promo Code'}
                </button>
            </div>

            {showForm && (
                <form className={styles.form} onSubmit={handleCreate}>
                    <h3>Create New Promo Code</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.field}>
                            <label>Code *</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g. SUMMER25"
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Type *</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Value *</label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                                placeholder={formData.type === 'percentage' ? 'e.g. 25' : 'e.g. 500'}
                                required
                                min="0"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Min Order (₹)</label>
                            <input
                                type="number"
                                value={formData.minOrderValue}
                                onChange={e => setFormData({ ...formData, minOrderValue: e.target.value })}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Max Discount (₹)</label>
                            <input
                                type="number"
                                value={formData.maxDiscount}
                                onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
                                placeholder="No limit"
                                min="0"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Usage Limit</label>
                            <input
                                type="number"
                                value={formData.usageLimit}
                                onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                                placeholder="Unlimited"
                                min="1"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Valid From *</label>
                            <input
                                type="date"
                                value={formData.validFrom}
                                onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Valid Until *</label>
                            <input
                                type="date"
                                value={formData.validUntil}
                                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.fieldFull}>
                            <label>Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. Summer sale - 25% off sitewide"
                            />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={submitting}>
                        {submitting ? <Loader2 size={16} className={styles.spinner} /> : <Check size={16} />}
                        Create Promo Code
                    </button>
                </form>
            )}

            {loading ? (
                <div className={styles.loading}>
                    <Loader2 size={32} className={styles.spinner} />
                    <p>Loading promo codes...</p>
                </div>
            ) : promos.length === 0 ? (
                <div className={styles.empty}>
                    <Tag size={48} />
                    <p>No promo codes yet. Create one above.</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Min Order</th>
                                <th>Usage</th>
                                <th>Valid Period</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promos.map(promo => (
                                <tr key={promo._id} className={isExpired(promo.validUntil) ? styles.expired : ''}>
                                    <td>
                                        <strong className={styles.code}>{promo.code}</strong>
                                        {promo.description && <small>{promo.description}</small>}
                                    </td>
                                    <td>{promo.type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                                    <td>
                                        {promo.type === 'percentage'
                                            ? `${promo.value}%`
                                            : `₹${promo.value}`
                                        }
                                        {promo.maxDiscount ? <small>max ₹{promo.maxDiscount}</small> : null}
                                    </td>
                                    <td>₹{promo.minOrderValue}</td>
                                    <td>{promo.usedCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''}</td>
                                    <td>{formatDate(promo.validFrom)} — {formatDate(promo.validUntil)}</td>
                                    <td>
                                        <button
                                            className={`${styles.statusBtn} ${promo.active ? styles.active : styles.inactive}`}
                                            onClick={() => toggleActive(promo)}
                                        >
                                            {promo.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                            {promo.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>
                                        <button className={styles.deleteBtn} onClick={() => deletePromo(promo._id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
