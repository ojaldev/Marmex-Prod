'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Check, X, Home, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './AddressSelector.module.css'

export default function AddressSelector({ onSelect, selectedAddress }) {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [fetchError, setFetchError] = useState(null)

    const [formData, setFormData] = useState({
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
        setLoading(true)
        setFetchError(null)
        try {
            const res = await fetch('/api/user/addresses')
            const data = await res.json()

            if (!res.ok) {
                setFetchError(data.error || 'Failed to load addresses')
                setAddresses([])
                setShowForm(true)
                return
            }

            const addrList = data.addresses || []
            setAddresses(addrList)

            // Auto-select default address
            const defaultAddr = addrList.find(a => a.isDefault)
            if (defaultAddr && !selectedAddress) {
                onSelect(defaultAddr)
            }

            // If no addresses, auto-show form
            if (addrList.length === 0) {
                setShowForm(true)
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
            setFetchError('Network error. Please try again.')
            setAddresses([])
            setShowForm(true)
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
        setSaving(true)
        setError(null)

        try {
            const res = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to save address. Please try again.')
                return
            }

            await fetchAddresses()
            setShowForm(false)
            // Select the newly added address
            if (data.address) {
                onSelect(data.address)
            }
            // Reset form
            setFormData({
                name: '', phone: '', line1: '', line2: '',
                city: '', state: '', pincode: '', isDefault: false
            })
        } catch (error) {
            console.error('Failed to save address:', error)
            setError('Network error. Please check your connection and try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.addressSelector}>
                <div className={styles.loading}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                </div>
            </div>
        )
    }

    return (
        <div className={styles.addressSelector}>
            <label className={styles.label}>
                <MapPin size={20} />
                Shipping Address
            </label>

            {/* Fetch Error Banner */}
            {fetchError && (
                <div className={styles.errorBanner}>
                    <AlertCircle size={18} />
                    <span>{fetchError}</span>
                </div>
            )}

            {/* Saved Addresses List */}
            {addresses.length > 0 && !showForm && (
                <div className={styles.addressGrid}>
                    {addresses.map((address) => (
                        <div
                            key={address._id || address.id}
                            className={`${styles.addressCard} ${selectedAddress?._id === address._id ? styles.selected : ''}`}
                            onClick={() => onSelect(address)}
                        >
                            <div className={styles.addressRadio}>
                                <div className={styles.radioOuter}>
                                    {selectedAddress?._id === address._id && (
                                        <div className={styles.radioInner} />
                                    )}
                                </div>
                            </div>
                            <div className={styles.addressContent}>
                                <div className={styles.addressHeader}>
                                    <strong>{address.name}</strong>
                                    {address.isDefault && (
                                        <span className={styles.defaultBadge}>Default</span>
                                    )}
                                </div>
                                <p className={styles.phone}>{address.phone}</p>
                                <p>{address.line1}</p>
                                {address.line2 && <p>{address.line2}</p>}
                                <p className={styles.cityRow}>{address.city}, {address.state} — {address.pincode}</p>
                            </div>
                            {selectedAddress?._id === address._id && (
                                <div className={styles.checkMark}>
                                    <Check size={16} />
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        className={styles.addNewBtn}
                        onClick={() => { setShowForm(true); setError(null) }}
                    >
                        <Plus size={24} />
                        <span>Add New Address</span>
                    </button>
                </div>
            )}

            {/* Add New Address Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className={styles.addressForm}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={styles.formHeader}>
                            <h3>
                                <Home size={18} />
                                {addresses.length === 0 ? 'Enter Shipping Address' : 'Add New Address'}
                            </h3>
                            {addresses.length > 0 && (
                                <button
                                    type="button"
                                    className={styles.closeBtn}
                                    onClick={() => setShowForm(false)}
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Submit Error */}
                        {error && (
                            <div className={styles.formError}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 95821 34493"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Address Line 1 *</label>
                            <input
                                type="text"
                                name="line1"
                                value={formData.line1}
                                onChange={handleChange}
                                placeholder="House no., Street, Colony"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Address Line 2</label>
                            <input
                                type="text"
                                name="line2"
                                value={formData.line2}
                                onChange={handleChange}
                                placeholder="Apartment, Landmark (optional)"
                            />
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>PIN Code *</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="600001"
                                    required
                                    maxLength="6"
                                    pattern="\d{6}"
                                />
                            </div>
                        </div>

                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                            />
                            <span>Set as default address</span>
                        </label>

                        <div className={styles.formActions}>
                            {addresses.length > 0 && (
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="button"
                                className={styles.saveBtn}
                                disabled={saving}
                                onClick={handleSubmit}
                            >
                                {saving ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
