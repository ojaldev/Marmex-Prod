'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import styles from './DeliveryDatePicker.module.css'

export default function DeliveryDatePicker({ onSelect, selectedDate }) {
    const getAvailableDates = () => {
        const dates = []
        const today = new Date()

        // Start from 2 days from now
        for (let i = 2; i <= 14; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            dates.push(date)
        }

        return dates
    }

    const availableDates = getAvailableDates()

    const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    }

    const getDeliverySlot = (date) => {
        const day = date.getDay()
        // Weekends get different slots
        if (day === 0 || day === 6) {
            return '10 AM - 6 PM'
        }
        return '9 AM - 9 PM'
    }

    return (
        <div className={styles.deliveryPicker}>
            <label className={styles.label}>
                <Calendar size={18} />
                Preferred Delivery Date
            </label>

            <div className={styles.dateGrid}>
                {availableDates.map((date, index) => (
                    <div
                        key={index}
                        className={`${styles.dateCard} ${selectedDate?.toDateString() === date.toDateString() ? styles.selected : ''}`}
                        onClick={() => onSelect(date)}
                    >
                        <div className={styles.dateLabel}>{formatDate(date)}</div>
                        <div className={styles.timeSlot}>{getDeliverySlot(date)}</div>
                    </div>
                ))}
            </div>

            <p className={styles.note}>
                * Delivery times are approximate and may vary based on your location
            </p>
        </div>
    )
}
