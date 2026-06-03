'use client'

import { useState } from 'react'
import { X, Truck, RotateCcw, MessageCircle } from 'lucide-react'
import styles from './AnnouncementBar.module.css'

export default function AnnouncementBar() {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    return (
        <div className={styles.bar}>
            <div className={styles.content}>
                <span className={styles.item}>
                    <Truck size={14} />
                    Free shipping on orders above ₹2,999
                </span>
                <span className={styles.divider} />
                <span className={styles.item}>
                    <RotateCcw size={14} />
                    30-day easy returns
                </span>
                <span className={styles.divider} />
                <span className={styles.item}>
                    <MessageCircle size={14} />
                    WhatsApp support: +91 95821 34493
                </span>
            </div>
            <button
                className={styles.closeBtn}
                onClick={() => setDismissed(true)}
                aria-label="Dismiss announcement"
            >
                <X size={14} />
            </button>
        </div>
    )
}
