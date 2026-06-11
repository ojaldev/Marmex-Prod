'use client'

import { useState, useEffect } from 'react'
import { X, Truck, RotateCcw, MessageCircle, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './AnnouncementBar.module.css'

const MESSAGES = [
    { icon: Truck, text: 'Free shipping on orders above ₹2,999' },
    { icon: Sparkles, text: 'Handcrafted by master artisans — every piece is unique' },
    { icon: RotateCcw, text: '30-day easy returns on all orders' },
    { icon: MessageCircle, text: 'Custom orders welcome — chat with us on WhatsApp' },
]

export default function AnnouncementBar() {
    const [dismissed, setDismissed] = useState(false)
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (dismissed) return
        const timer = setInterval(() => setIndex(i => (i + 1) % MESSAGES.length), 4000)
        return () => clearInterval(timer)
    }, [dismissed])

    if (dismissed) return null

    const { icon: Icon, text } = MESSAGES[index]

    return (
        <div className={styles.bar}>
            <div className={styles.content}>
                <AnimatePresence mode="wait">
                    <motion.span
                        key={index}
                        className={styles.item}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Icon size={14} />
                        {text}
                    </motion.span>
                </AnimatePresence>
            </div>

            <div className={styles.indicators}>
                {MESSAGES.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                        onClick={() => setIndex(i)}
                        aria-label={`Message ${i + 1}`}
                    />
                ))}
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
