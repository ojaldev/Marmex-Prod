'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, Mail, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import styles from './confirmation.module.css'

export default function OrderConfirmationPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [orderNumber, setOrderNumber] = useState('')
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const orderParam = searchParams.get('order')
        if (!orderParam) {
            router.push('/')
            return
        }
        setOrderNumber(orderParam)
    }, [searchParams, router])

    // Fetch order details to show tracking
    useEffect(() => {
        if (!orderNumber) return

        const fetchOrder = async () => {
            try {
                // Try to fetch from account orders API (if logged in)
                // or we could add a public order lookup endpoint
                // For now, we'll just show what we have from URL params
                setLoading(false)
            } catch (err) {
                console.error('Failed to fetch order:', err)
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderNumber])

    if (!orderNumber) {
        return null
    }

    const trackingUrl = order?.shiprocket?.awbCode
        ? `https://shiprocket.co/tracking/${order.shiprocket.awbCode}`
        : null

    return (
        <main className={styles.confirmationPage}>
            <div className="container">
                <motion.div
                    className={styles.confirmationCard}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Success Icon */}
                    <div className={styles.successIcon}>
                        <CheckCircle size={80} />
                    </div>

                    {/* Header */}
                    <h1>Order Confirmed!</h1>
                    <p className={styles.subtitle}>
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>

                    {/* Order Number */}
                    <div className={styles.orderNumber}>
                        <span>Order Number</span>
                        <strong>#{orderNumber}</strong>
                    </div>

                    {/* Tracking Box (if shipment created) */}
                    {order?.shiprocket?.awbCode && (
                        <motion.div
                            className={styles.trackingBox}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className={styles.trackingLabel}>Tracking Number</div>
                            <div className={styles.awbCode}>{order.shiprocket.awbCode}</div>
                            <div className={styles.courierName}>{order.shiprocket.courierName}</div>
                            <a
                                href={trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.trackBtn}
                            >
                                Track Shipment <ExternalLink size={16} />
                            </a>
                        </motion.div>
                    )}

                    {/* Status Steps */}
                    <div className={styles.statusSteps}>
                        <div className={`${styles.statusStep} ${styles.stepActive}`}>
                            <div className={styles.stepIcon}>
                                <CheckCircle size={24} />
                            </div>
                            <div className={styles.stepInfo}>
                                <strong>Order Confirmed</strong>
                                <span>We&apos;ve received your order</span>
                            </div>
                        </div>

                        <div className={styles.statusLine} />

                        <div className={`${styles.statusStep} ${order?.shiprocket?.awbCode ? styles.stepActive : ''}`}>
                            <div className={styles.stepIcon}>
                                <Package size={24} />
                            </div>
                            <div className={styles.stepInfo}>
                                <strong>Processing</strong>
                                <span>Preparing your items</span>
                            </div>
                        </div>

                        <div className={styles.statusLine} />

                        <div className={styles.statusStep}>
                            <div className={styles.stepIcon}>
                                <Truck size={24} />
                            </div>
                            <div className={styles.stepInfo}>
                                <strong>Shipped</strong>
                                <span>On its way to you</span>
                            </div>
                        </div>

                        <div className={styles.statusLine} />

                        <div className={styles.statusStep}>
                            <div className={styles.stepIcon}>
                                <Mail size={24} />
                            </div>
                            <div className={styles.stepInfo}>
                                <strong>Delivered</strong>
                                <span>Enjoy your purchase!</span>
                            </div>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className={styles.infoCards}>
                        <div className={styles.infoCard}>
                            <h3>What&apos;s Next?</h3>
                            <ul>
                                <li>You&apos;ll receive a confirmation email shortly</li>
                                <li>We&apos;ll notify you when your order ships</li>
                                <li>Track your order anytime in your account</li>
                                <li>Estimated delivery: 5-7 business days</li>
                            </ul>
                        </div>

                        <div className={styles.infoCard}>
                            <h3>Need Help?</h3>
                            <p>
                                If you have any questions about your order, please don&apos;t hesitate to contact us:
                            </p>
                            <p>
                                <strong>Email:</strong> support@marmexindia.com<br />
                                <strong>Phone:</strong> +91 1234567890<br />
                                <strong>Hours:</strong> Mon-Sat, 9AM-6PM IST
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <Link href="/account/orders" className="btn btn-primary">
                            View My Orders
                        </Link>
                        <Link href="/products" className="btn btn-outline">
                            Continue Shopping
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    )
}
