'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CheckCircle, Package, Truck, Mail } from 'lucide-react'
import styles from './confirmation.module.css'

export default function OrderConfirmationPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [orderNumber, setOrderNumber] = useState('')

    useEffect(() => {
        const order = searchParams.get('order')
        if (!order) {
            router.push('/')
            return
        }
        setOrderNumber(order)
    }, [searchParams, router])

    if (!orderNumber) {
        return null
    }

    return (
        <>
            <Header />
            <main className={styles.confirmationPage}>
                <div className="container">
                    <div className={styles.confirmationCard}>
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

                            <div className={styles.statusStep}>
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
                            <Link href="/products" className="btn btn-primary">
                                Continue Shopping
                            </Link>
                            <Link href="/" className="btn btn-outline">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
