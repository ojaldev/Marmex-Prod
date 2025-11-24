'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Package, Search, Filter } from 'lucide-react'
import styles from './orders.module.css'

export default function OrdersPage() {
    const { data: session } = useSession()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [filter])

    const fetchOrders = async () => {
        try {
            const url = `/api/orders?status=${filter}`
            const res = await fetch(url)
            const data = await res.json()
            setOrders(data.orders || [])
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: '#fbbf24',
            confirmed: '#3b82f6',
            processing: '#8b5cf6',
            shipped: '#06b6d4',
            delivered: '#10b981',
            cancelled: '#ef4444',
            returned: '#f59e0b'
        }
        return colors[status] || '#6b7280'
    }

    const filteredOrders = orders.filter(order =>
        searchQuery === '' ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return <div className={styles.loading}>Loading orders...</div>
    }

    return (
        <div className={styles.ordersPage}>
            <div className="container">
                <h1>My Orders</h1>

                {/* Filters */}
                <div className={styles.controls}>
                    <div className={styles.search}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by order number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterButtons}>
                        {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <button
                                key={status}
                                className={filter === status ? styles.active : ''}
                                onClick={() => setFilter(status)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className={styles.empty}>
                        <Package size={64} />
                        <h2>No orders found</h2>
                        <p>
                            {searchQuery ?
                                'Try a different search term' :
                                'Start shopping to create your first order!'
                            }
                        </p>
                        <Link href="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className={styles.ordersList}>
                        {filteredOrders.map(order => (
                            <Link
                                key={order._id}
                                href={`/account/orders/${order._id}`}
                                className={styles.orderCard}
                            >
                                <div className={styles.orderHeader}>
                                    <div>
                                        <h3>Order #{order.orderNumber}</h3>
                                        <p className={styles.orderDate}>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
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

                                <div className={styles.orderItems}>
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <div key={index} className={styles.orderItemPreview}>
                                            {item.image && (
                                                <img src={item.image} alt={item.name} />
                                            )}
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className={styles.moreItems}>
                                            +{order.items.length - 3} more
                                        </div>
                                    )}
                                </div>

                                <div className={styles.orderFooter}>
                                    <div className={styles.orderTotal}>
                                        <span>Total:</span>
                                        <strong>₹{order.total.toLocaleString()}</strong>
                                    </div>
                                    <div className={styles.itemCount}>
                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
