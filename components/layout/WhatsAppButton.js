'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import styles from './WhatsAppButton.module.css'

const MESSAGE = 'Hi Marmex India! I am interested in your marble products. Can you help me?'

export default function WhatsAppButton() {
    const [showTooltip, setShowTooltip] = useState(false)

    return (
        <div
            className={styles.wrapper}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.button}
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle size={28} fill="currentColor" />
            </a>
            {showTooltip && (
                <div className={styles.tooltip}>
                    <span className={styles.dot} />
                    <span>Active 10am–8pm IST</span>
                </div>
            )}
        </div>
    )
}
