'use client'

import { useState, useEffect } from 'react'
import { Plus, MapPin, Trash2, Check } from 'lucide-react'
import styles from './addresses.module.css'

export default function AddressesPage() {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        type: 'home',
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    })

    useEffect(() => {
        fetchAddresses()
    }, [])

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/user/addresses')
            const data = await res.json()
            setAddresses(data.addresses || [])
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const url = editingId
                ? `/api/user/addresses/${editingId}`
                : '/api/user/addresses'

            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                fetchAddresses()
                resetForm()
            }
        } catch (error) {
            console.error('Failed to save address:', error)
        }
    }

    const handleEdit = (address) => {
        setFormData(address)
        setEditingId(address._id)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this address?')) return

        try {
            const res = await fetch(`/api/user/addresses/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchAddresses()
            }
        } catch (error) {
            console.error('Failed to delete address:', error)
        }
    }

    const resetForm = () => {
        setFormData({
            type: 'home',
            name: '',
            phone: '',
            line1: '',
            line2: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false
        })
        setShowForm(false)
        setEditingId(null)
    }

    if (loading) return <div className={styles.loading}>Loading addresses...</div>

    return (
        <div className={styles.addressesPage}>
            <div className="container">
                <div className={styles.header}>
                    <h1>My Addresses</h1>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        <Plus size={20} />
                        Add New Address
                    </button>
                </div>

                {/* Address Form */}
                {showForm && (
                    <div className={styles.formModal}>
                        <div className={styles.formCard}>
                            <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Type</label>
                                        <select name="type" value={formData.type} onChange={handleChange}>
                                            <option value="home">Home</option>
                                            <option value="work">Work</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Full Name *</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Phone Number *</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Address Line 1 *</label>
                                    <input type="text" name="line1" value={formData.line1} onChange={handleChange} required />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Address Line 2</label>
                                    <input type="text" name="line2" value={formData.line2} onChange={handleChange} />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>City *</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>State *</label>
                                        <input type="text" name="state" value={formData.state} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Pincode *</label>
                                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className={styles.checkboxGroup}>
                                    <label>
                                        <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
                                        <span>Set as default address</span>
                                    </label>
                                </div>

                                <div className={styles.formActions}>
                                    <button type="button" onClick={resetForm} className="btn btn-outline">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingId ? 'Update Address' : 'Save Address'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Addresses List */}
                <div className={styles.addressList}>
                    {addresses.length === 0 ? (
                        <div className={styles.empty}>
                            <MapPin size={48} />
                            <p>No addresses saved yet</p>
                            <button onClick={() => setShowForm(true)} className="btn btn-primary">
                                Add Your First Address
                            </button>
                        </div>
                    ) : (
                        addresses.map(address => (
                            <div key={address._id} className={styles.addressCard}>
                                {address.isDefault && (
                                    <span className={styles.defaultBadge}>
                                        <Check size={14} /> Default
                                    </span>
                                )}

                                <div className={styles.addressType}>{address.type}</div>
                                <h3>{address.name}</h3>
                                <p>{address.phone}</p>
                                <p className={styles.addressText}>
                                    {address.line1}<br />
                                    {address.line2 && <>{address.line2}<br /></>}
                                    {address.city}, {address.state} {address.pincode}
                                </p>

                                <div className={styles.addressActions}>
                                    <button onClick={() => handleEdit(address)} className={styles.editBtn}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(address._id)} className={styles.deleteBtn}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
