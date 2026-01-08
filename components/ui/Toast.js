'use client'

import { useNotification } from '@/contexts/NotificationContext'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import styles from './Toast.module.css'

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
}

export default function ToastContainer() {
    const { notifications, removeNotification } = useNotification()

    return (
        <div className={styles.container}>
            {notifications.map(notification => {
                const Icon = icons[notification.type] || icons.info

                return (
                    <div
                        key={notification.id}
                        className={`${styles.toast} ${styles[notification.type]}`}
                        role="alert"
                    >
                        <div className={styles.iconWrapper}>
                            <Icon size={20} />
                        </div>
                        <p className={styles.message}>{notification.message}</p>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className={styles.closeBtn}
                            aria-label="Close notification"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
