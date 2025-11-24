'use client'

import { Truck } from 'lucide-react'
import styles from './ShippingMethodSelector.module.css'

const SHIPPING_METHODS = [
    {
        id: 'standard',
        name: 'Standard Delivery',
        description: '5-7 business days',
        cost: 0,
        icon: '📦'
    },
    {
        id: 'express',
        name: 'Express Delivery',
        description: '2-3 business days',
        cost: 149,
        icon: '⚡'
    },
    {
        id: 'same-day',
        name: 'Same Day Delivery',
        description: 'Order before 12 PM',
        cost: 299,
        icon: '🚀',
        note: 'Available in select cities only'
    }
]

export default function ShippingMethodSelector({ onSelect, selectedMethod, cartTotal }) {
    // Free shipping for orders above threshold
    const freeShippingThreshold = 2999
    const isFreeShipping = cartTotal >= freeShippingThreshold

    return (
        <div className={styles.shippingSelector}>
            <label className={styles.label}>
                <Truck size={18} />
                Shipping Method
            </label>

            {isFreeShipping && (
                <div className={styles.freeShippingBanner}>
                    🎉 You qualify for FREE standard shipping!
                </div>
            )}

            <div className={styles.methodGrid}>
                {SHIPPING_METHODS.map((method) => {
                    const finalCost = method.id === 'standard' && isFreeShipping ? 0 : method.cost

                    return (
                        <div
                            key={method.id}
                            className={`${styles.methodCard} ${selectedMethod?.id === method.id ? styles.selected : ''}`}
                            onClick={() => onSelect({ ...method, cost: finalCost })}
                        >
                            <div className={styles.methodIcon}>{method.icon}</div>
                            <div className={styles.methodInfo}>
                                <strong>{method.name}</strong>
                                <p>{method.description}</p>
                                {method.note && <small className={styles.note}>{method.note}</small>}
                            </div>
                            <div className={styles.methodCost}>
                                {finalCost === 0 ? (
                                    <span className={styles.free}>FREE</span>
                                ) : (
                                    `₹${finalCost}`
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
