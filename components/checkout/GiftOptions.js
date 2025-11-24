'use client'

import { useState } from 'react'
import { Gift } from 'lucide-react'
import styles from './GiftOptions.module.css'

const GIFT_WRAPPING_COST = 99

export default function GiftOptions({ onUpdate, giftData }) {
    const [isGift, setIsGift] = useState(giftData?.isGift || false)
    const [giftMessage, setGiftMessage] = useState(giftData?.message || '')

    const handleToggle = (checked) => {
        setIsGift(checked)
        if (!checked) {
            setGiftMessage('')
            onUpdate({ isGift: false, message: '', cost: 0 })
        } else {
            onUpdate({ isGift: true, message: giftMessage, cost: GIFT_WRAPPING_COST })
        }
    }

    const handleMessageChange = (e) => {
        const message = e.target.value
        setGiftMessage(message)
        if (isGift) {
            onUpdate({ isGift: true, message, cost: GIFT_WRAPPING_COST })
        }
    }

    return (
        <div className={styles.giftOptions}>
            <label className={styles.giftToggle}>
                <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => handleToggle(e.target.checked)}
                />
                <span className={styles.checkbox} />
                <div className={styles.giftLabel}>
                    <Gift size={20} />
                    <div>
                        <strong>This is a gift</strong>
                        <small>Add gift wrapping and personal message (+₹{GIFT_WRAPPING_COST})</small>
                    </div>
                </div>
            </label>

            {isGift && (
                <div className={styles.giftMessageSection}>
                    <label>Gift Message (Optional)</label>
                    <textarea
                        value={giftMessage}
                        onChange={handleMessageChange}
                        placeholder="Add a personal message for the recipient..."
                        maxLength={200}
                        rows={4}
                    />
                    <small>{giftMessage.length}/200 characters</small>
                </div>
            )}
        </div>
    )
}
