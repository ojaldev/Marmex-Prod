'use client'

import { MessageCircle } from 'lucide-react'
import styles from './WhatsAppButton.module.css'

const PHONE = '919582134493'
const MESSAGE = 'Hi Marmex India! I am interested in your marble products. Can you help me?'

export default function WhatsAppButton() {
    return (
        <a
            href={`https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={28} fill="currentColor" />
        </a>
    )
}
