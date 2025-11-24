'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus } from 'lucide-react'
import styles from './AddressSelector.module.css'

export default function AddressSelector({ onSelect, selectedAddress }) {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        fetchAddresses()
    }, [])

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/user/addresses')
            if (res.ok) {
                const data = await res.json()
                setAddresses(data.addresses || [])

                // Auto-select default address
                const defaultAddr = data.addresses?.find(a => a.isDefault)
                if (defaultAddr && !selectedAddress) {
                    onSelect(defaultAddr)
                }
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className={styles.loading}>Loading addresses...</div>
    }

    if (addresses.length === 0 || showForm) {
        return (
            <div className={styles.emptyState}>
                <p>No saved addresses found</p>
                <small>Please add your shipping address manually below</small>
            </div>
        )
    }

    return (
        <div className={styles.addressSelector}>
            <label className={styles.label}>
                <MapPin size={18} />
                Select Shipping Address
            </label>

            <div className={styles.addressGrid}>
                {addresses.map((address) => (
                    <div
                        key={address._id}
                        className={`${styles.addressCard} ${selectedAddress?._id === address._id ? styles.selected : ''}`}
                        onClick={() => onSelect(address)}
                    >
                        <div className={styles.addressContent}>
                            <strong>{address.name}</strong>
                            <p>{address.phone}</p>
                            <p>{address.line1}</p>
                            {address.line2 && <p>{address.line2}</p>}
                            <p>{address.city}, {address.state} {address.pincode}</p>
                        </div>
                        {address.isDefault && (
                            <span className={styles.defaultBadge}>Default</span>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    className={styles.addNewBtn}
                    onClick={() => setShowForm(true)}
                >
                    <Plus size={24} />
                    <span>Add New Address</span>
                </button>
            </div>
        </div>
    )
}
