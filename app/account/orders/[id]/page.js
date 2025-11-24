'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, CreditCard, Download, RotateCcw, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import styles from './order-detail.module.css'

export default function OrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { addToCart } = useCart()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchOrder()
        }
    }, [params.id])

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${params.id}`)
            if (!res.ok) throw new Error('Order not found')
            const data = await res.json()
            setOrder(data.order)
        } catch (error) {
            console.error('Failed to fetch order:', error)
            router.push('/account/orders')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return

        try {
            const res = await fetch(`/api/orders/${params.id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchOrder() // Refresh order data
                alert('Order cancelled successfully')
            }
        } catch (error) {
            alert('Failed to cancel order')
        }
    }

    const handleReorder = async () => {
        try {
            const res = await fetch(`/api/orders/${params.id}/reorder`, {
                method: 'POST'
            })

            if (res.ok) {
                const data = await res.json()
                // Add items to cart context
                data.items.forEach(item => {
                    addToCart(item)
                })
                router.push('/cart')
            } else {
                throw new Error('Failed to reorder')
            }
        } catch (error) {
            alert('Failed to add items to cart')
        }
    }

    const handleDownloadInvoice = () => {
        window.open(`/api/orders/${params.id}/invoice`, '_blank')
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: '#fbbf24',
            confirmed: '#3b82f6',
            processing: '#8b5cf6',
            shipped: '#06b6d4',
            delivered: '#10b981',
            cancelled: '#ef4444'
        }
        return colors[status] || '#6b7280'
    }

    if (loading) {
        return <div className={styles.loading}>Loading order details...</div>
    }

    if (!order) {
        return null
    }

    const canCancel = ['pending', 'confirmed'].includes(order.status)

    return (
        <div className={styles.orderDetailPage}>
            <div className="container">
                <Link href="/account/orders" className={styles.backLink}>
                    <ArrowLeft size={20} />
                    Back to Orders
                </Link>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>Order #{order.orderNumber}</h1>
                        <p className={styles.orderDate}>
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                        {order.status}
                    </span>
                </div>

                <div className={styles.content}>
                    {/* Timeline */}
                    <div className={styles.timeline}>
                        <h2>Order Timeline</h2>
                        <div className={styles.timelineItems}>
                            {order.timeline.map((item, index) => (
                                <div key={index} className={styles.timelineItem}>
                                    <div className={styles.timelineDot} />
                                    <div className={styles.timelineContent}>
                                        <strong>{item.status}</strong>
                                        <p>{item.note}</p>
                                        <small>
                                            {new Date(item.timestamp).toLocaleString('en-IN')}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Items */}
                    <div className={styles.section}>
                        <h2>
                            <Package size={20} />
                            Order Items ({order.items.length})
                        </h2>
                        <div className={styles.items}>
                            {order.items.map((item, index) => (
                                <div key={index} className={styles.item}>
                                    {item.image && (
                                        <div className={styles.itemImage}>
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                    )}
                                    <div className={styles.itemInfo}>
                                        <h3>{item.name}</h3>
                                        <p>Quantity: {item.quantity}</p>
                                        {item.discount > 0 && (
                                            <p className={styles.discount}>
                                                Discount: ₹{item.discount.toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className={styles.itemPrice}>
                                        ₹{item.price.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className={styles.section}>
                        <h2>
                            <MapPin size={20} />
                            Shipping Address
                        </h2>
                        <div className={styles.address}>
                            <p><strong>{order.shippingAddress.name}</strong></p>
                            <p>{order.shippingAddress.phone}</p>
                            <p>{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className={styles.section}>
                        <h2>
                            <CreditCard size={20} />
                            Payment Information
                        </h2>
                        <div className={styles.payment}>
                            <div className={styles.paymentRow}>
                                <span>Payment Method:</span>
                                <strong>{order.payment.method.toUpperCase()}</strong>
                            </div>
                            <div className={styles.paymentRow}>
                                <span>Payment Status:</span>
                                <strong className={order.payment.status === 'completed' ? styles.paid : styles.pending}>
                                    {order.payment.status}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className={styles.summary}>
                        <h2>Order Summary</h2>
                        <div className={styles.summaryRow}>
                            <span>Subtotal:</span>
                            <span>₹{order.subtotal.toLocaleString()}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className={styles.summaryRow}>
                                <span>Discount:</span>
                                <span className={styles.discount}>-₹{order.discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className={styles.summaryRow}>
                            <span>Shipping:</span>
                            <span>₹{order.shipping.toLocaleString()}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax (GST):</span>
                            <span>₹{order.tax.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Total:</span>
                            <strong>₹{order.total.toLocaleString()}</strong>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        {canCancel && (
                            <button onClick={handleCancelOrder} className={styles.cancelBtn}>
                                <X size={18} />
                                Cancel Order
                            </button>
                        )}
                        <button onClick={handleDownloadInvoice} className={styles.actionBtn}>
                            <Download size={18} />
                            Download Invoice
                        </button>
                        <button onClick={handleReorder} className={styles.actionBtn}>
                            <RotateCcw size={18} />
                            Reorder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
