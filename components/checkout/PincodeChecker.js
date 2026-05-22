'use client'

import { useState } from 'react'
import { MapPin, Check, X, Truck, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './PincodeChecker.module.css'

export default function PincodeChecker({ productWeight = 1, codAvailable = true }) {
    const [pincode, setPincode] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const checkPincode = async () => {
        if (!pincode || pincode.length !== 6) return

        setLoading(true)
        setResult(null)

        try {
            const params = new URLSearchParams({
                deliveryPincode: pincode,
                cod: codAvailable ? '1' : '0',
                weight: String(productWeight)
            })

            const res = await fetch(`/api/shiprocket/serviceability?${params.toString()}`)
            const data = await res.json()

            if (!res.ok) {
                setResult({ error: data.error || 'Service check failed', serviceable: false })
            } else {
                setResult({
                    serviceable: data.serviceable,
                    couriers: data.couriers,
                    recommended: data.recommended,
                    pincode
                })
            }
        } catch (err) {
            setResult({ error: err.message, serviceable: false })
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') checkPincode()
    }

    return (
        <div className={styles.pincodeChecker}>
            <div className={styles.inputRow}>
                <div className={styles.inputWrapper}>
                    <MapPin size={16} className={styles.inputIcon} />
                    <input
                        type="text"
                        value={pincode}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setPincode(val)
                            if (val.length !== 6) setResult(null)
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter delivery pincode"
                        maxLength={6}
                        className={styles.input}
                    />
                </div>
                <button
                    onClick={checkPincode}
                    disabled={pincode.length !== 6 || loading}
                    className={styles.checkBtn}
                >
                    {loading ? 'Checking...' : 'Check'}
                </button>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        className={styles.result}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {result.error ? (
                            <div className={styles.error}>
                                <X size={16} />
                                <span>{result.error}</span>
                            </div>
                        ) : result.serviceable ? (
                            <div className={styles.success}>
                                <Check size={16} />
                                <div className={styles.successContent}>
                                    <span>Delivery available to {result.pincode}</span>
                                    {result.recommended && (
                                        <div className={styles.deliveryInfo}>
                                            <span><Truck size={14} /> {result.recommended.name}</span>
                                            <span><Clock size={14} /> {result.recommended.estimatedDays} day{result.recommended.estimatedDays !== '1' ? 's' : ''}</span>
                                            <span>₹{result.recommended.rate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.notAvailable}>
                                <X size={16} />
                                <span>Sorry, delivery not available to {result.pincode}</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
