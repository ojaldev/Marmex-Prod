'use client'

import { useState, useEffect, useCallback } from 'react'
import { Truck, AlertCircle, Clock, Star, MapPin, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ShiprocketShippingSelector.module.css'

export default function ShiprocketShippingSelector({
    destinationPincode,
    cartTotal,
    cartWeight = 1,
    isCod = false,
    onSelect,
    selectedMethod
}) {
    const [couriers, setCouriers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [serviceable, setServiceable] = useState(true)

    const freeShippingThreshold = 2999
    const isFreeShipping = cartTotal >= freeShippingThreshold

    const fetchRates = useCallback(async () => {
        if (!destinationPincode || destinationPincode.length !== 6) {
            setCouriers([])
            setError(null)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                deliveryPincode: destinationPincode,
                cod: isCod ? '1' : '0',
                weight: String(cartWeight)
            })

            const res = await fetch(`/api/shiprocket/rates?${params.toString()}`)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch rates')
            }

            if (!data.rates || data.rates.length === 0) {
                setServiceable(false)
                setCouriers([])
            } else {
                setServiceable(true)
                // Mark cheapest and fastest
                const sortedByRate = [...data.rates].sort((a, b) => a.rate - b.rate)
                const sortedByDays = [...data.rates].sort((a, b) => {
                    const aDays = parseInt(a.estimatedDays) || 99
                    const bDays = parseInt(b.estimatedDays) || 99
                    return aDays - bDays
                })

                const cheapestId = sortedByRate[0]?.id
                const fastestId = sortedByDays[0]?.id

                const enriched = data.rates.map(c => ({
                    ...c,
                    tag: c.isRecommended
                        ? 'recommended'
                        : c.id === cheapestId
                            ? 'cheapest'
                            : c.id === fastestId
                                ? 'fastest'
                                : null
                }))

                setCouriers(enriched)

                // Auto-select recommended or first option
                if (!selectedMethod) {
                    const recommended = enriched.find(c => c.isRecommended) || enriched[0]
                    if (recommended) {
                        onSelect({
                            id: String(recommended.id),
                            name: recommended.name,
                            cost: isFreeShipping ? 0 : recommended.rate,
                            originalCost: recommended.rate,
                            codCharges: recommended.codCharges,
                            estimatedDays: recommended.estimatedDays,
                            rating: recommended.rating,
                            shiprocketCourierId: recommended.id
                        })
                    }
                }
            }
        } catch (err) {
            console.error('Fetch rates error:', err)
            setError(err.message)
            setCouriers([])
        } finally {
            setLoading(false)
        }
    }, [destinationPincode, cartWeight, isCod, isFreeShipping, onSelect, selectedMethod])

    useEffect(() => {
        fetchRates()
    }, [fetchRates])

    const handleSelect = (courier) => {
        onSelect({
            id: String(courier.id),
            name: courier.name,
            cost: isFreeShipping ? 0 : courier.rate,
            originalCost: courier.rate,
            codCharges: courier.codCharges,
            estimatedDays: courier.estimatedDays,
            rating: courier.rating,
            shiprocketCourierId: courier.id
        })
    }

    if (!destinationPincode || destinationPincode.length !== 6) {
        return (
            <div className={styles.shippingSelector}>
                <label className={styles.label}>
                    <Truck size={20} />
                    Shipping Method
                </label>
                <div className={styles.notServiceable}>
                    <MapPin size={18} />
                    <span>Please enter a complete delivery address to see shipping options</span>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className={styles.shippingSelector}>
                <label className={styles.label}>
                    <Truck size={20} />
                    Shipping Method
                </label>
                <div className={styles.loadingState}>
                    <div className={styles.skeletonRow} />
                    <div className={styles.skeletonRow} />
                    <div className={styles.skeletonRow} />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.shippingSelector}>
                <label className={styles.label}>
                    <Truck size={20} />
                    Shipping Method
                </label>
                <div className={styles.errorState}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            </div>
        )
    }

    if (!serviceable) {
        return (
            <div className={styles.shippingSelector}>
                <label className={styles.label}>
                    <Truck size={20} />
                    Shipping Method
                </label>
                <div className={styles.notServiceable}>
                    <AlertCircle size={18} />
                    <span>Sorry, we do not deliver to pincode {destinationPincode} yet. Please try a different address.</span>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.shippingSelector}>
            <label className={styles.label}>
                <Truck size={20} />
                Shipping Method
            </label>

            {isFreeShipping && (
                <motion.div
                    className={styles.freeShippingBanner}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Package size={18} />
                    <span>You qualify for FREE standard shipping on this order!</span>
                </motion.div>
            )}

            <div className={styles.courierGrid}>
                <AnimatePresence>
                    {couriers.map((courier) => (
                        <motion.div
                            key={courier.id}
                            className={`${styles.courierCard} ${
                                selectedMethod?.shiprocketCourierId === courier.id ? styles.selected : ''
                            } ${courier.isRecommended ? styles.recommended : ''}`}
                            onClick={() => handleSelect(courier)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={styles.radio}>
                                {selectedMethod?.shiprocketCourierId === courier.id && (
                                    <div className={styles.radioDot} />
                                )}
                            </div>

                            <div className={styles.courierInfo}>
                                <div className={styles.courierName}>
                                    {courier.name}
                                    {courier.tag && (
                                        <span className={`${styles.badge} ${
                                            courier.tag === 'recommended' ? styles.badgeRecommended :
                                            courier.tag === 'fastest' ? styles.badgeFastest :
                                            styles.badgeCheapest
                                        }`}>
                                            {courier.tag}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.courierMeta}>
                                    <span><Clock size={14} /> {courier.estimatedDays} day{courier.estimatedDays !== '1' ? 's' : ''}</span>
                                    {courier.rating > 0 && (
                                        <span className={styles.rating}><Star size={14} /> {courier.rating.toFixed(1)}</span>
                                    )}
                                    {courier.pickupPerformance > 0 && (
                                        <span>{courier.pickupPerformance}% pickup</span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.courierCost}>
                                {isFreeShipping ? (
                                    <>
                                        <strong className={styles.free}>FREE</strong>
                                        <span><s>₹{courier.rate}</s></span>
                                    </>
                                ) : (
                                    <>
                                        <strong>₹{courier.rate}</strong>
                                        {isCod && courier.codCharges > 0 && (
                                            <span>+ ₹{courier.codCharges} COD</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <p className={styles.infoFooter}>
                Rates are live from Shiprocket. Actual delivery time may vary.
            </p>
        </div>
    )
}
