'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, Search, Filter, Truck, CheckCircle, XCircle, RotateCcw,
    Download, Eye, RefreshCw, Calendar, IndianRupee, Users,
    TrendingUp, ChevronLeft, ChevronRight, X, ExternalLink, Clock, Zap
} from 'lucide-react'
import styles from './orders.module.css'

const STATUS_CONFIG = {
    pending: { color: '#fbbf24', label: 'Pending', icon: Package },
    confirmed: { color: '#3b82f6', label: 'Confirmed', icon: CheckCircle },
    processing: { color: '#8b5cf6', label: 'Processing', icon: RefreshCw },
    shipped: { color: '#06b6d4', label: 'Shipped', icon: Truck },
    delivered: { color: '#10b981', label: 'Delivered', icon: CheckCircle },
    cancelled: { color: '#ef4444', label: 'Cancelled', icon: XCircle },
    returned: { color: '#f59e0b', label: 'Returned', icon: RotateCcw }
}

export default function AdminOrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [refreshingOrderId, setRefreshingOrderId] = useState(null)
    const [syncingAll, setSyncingAll] = useState(false)
    const [lastSynced, setLastSynced] = useState(null)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filter !== 'all') params.append('status', filter)
            if (search) params.append('search', search)
            params.append('page', String(page))
            params.append('limit', '20')

            const res = await fetch(`/api/admin/orders?${params.toString()}`)
            const data = await res.json()

            if (res.ok) {
                setOrders(data.orders || [])
                setStats(data.stats)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
        }
    }, [filter, search, page])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // Auto-poll tracking for active orders every 2 minutes
    useEffect(() => {
        const ACTIVE_STATUSES = ['pending', 'processing', 'shipped']
        const hasActive = orders.some(o => ACTIVE_STATUSES.includes(o.status) && o.shiprocket?.awbCode)
        if (!hasActive) return

        const interval = setInterval(() => {
            fetchOrders()
            setLastSynced(new Date())
        }, 2 * 60 * 1000) // 2 minutes

        return () => clearInterval(interval)
    }, [orders, fetchOrders])

    const handleDownloadLabel = async (order) => {
        if (!order.shiprocket?.shipmentId) {
            alert('No shipment ID available for this order')
            return
        }
        try {
            const res = await fetch('/api/shiprocket/create-shipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order._id })
            })
            const data = await res.json()
            if (data.shipment?.labelUrl) {
                window.open(data.shipment.labelUrl, '_blank')
            } else {
                alert('Label not available yet')
            }
        } catch (err) {
            alert('Failed to generate label')
        }
    }

    const handleTrackOrder = (order) => {
        if (order.shiprocket?.awbCode) {
            window.open(`https://shiprocket.co/tracking/${order.shiprocket.awbCode}`, '_blank')
        } else {
            alert('No tracking number available')
        }
    }

    const handleCancelShipment = async (order) => {
        if (!confirm('Cancel this shipment in Shiprocket?')) return
        try {
            const res = await fetch('/api/shiprocket/create-shipment', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [order.shiprocket?.orderId] })
            })
            if (res.ok) {
                alert('Shipment cancelled')
                fetchOrders()
            }
        } catch (err) {
            alert('Failed to cancel shipment')
        }
    }

    const openDetail = (order) => {
        setSelectedOrder(order)
        setDetailOpen(true)
    }

    const handleRefreshOrder = async (order) => {
        if (!order.shiprocket?.awbCode) return
        setRefreshingOrderId(order._id)
        try {
            const res = await fetch(`/api/admin/orders/${order._id}/refresh-tracking`)
            const data = await res.json()
            if (data.success) {
                setLastSynced(new Date())
                fetchOrders()
                // If detail modal is open for this order, refresh it
                if (selectedOrder?._id === order._id && data.order) {
                    setSelectedOrder(prev => ({ ...prev, ...data.order }))
                }
            }
        } catch (err) {
            console.error('Refresh failed:', err)
        } finally {
            setRefreshingOrderId(null)
        }
    }

    const handleSyncAll = async () => {
        setSyncingAll(true)
        try {
            const res = await fetch('/api/admin/orders/refresh-all')
            const data = await res.json()
            if (data.success) {
                setLastSynced(new Date())
                fetchOrders()
                alert(`Synced ${data.results.updated} orders. Failed: ${data.results.failed}`)
            }
        } catch (err) {
            console.error('Bulk sync failed:', err)
        } finally {
            setSyncingAll(false)
        }
    }

    const statCards = stats ? [
        { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: '#D4A574' },
        { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: '#10b981' },
        { label: 'Shipped', value: stats.shipped, icon: Truck, color: '#06b6d4' },
        { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: '#10b981' },
        { label: 'Pending', value: stats.pending, icon: RefreshCw, color: '#fbbf24' },
        { label: 'Processing', value: stats.processing, icon: Package, color: '#8b5cf6' }
    ] : []

    return (
        <div className={styles.ordersPage}>
            <div className={styles.header}>
                <div>
                    <h1>Orders Management</h1>
                    <p>Manage all customer orders, shipments, and tracking</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        onClick={handleSyncAll}
                        disabled={syncingAll}
                        className={styles.syncBtn}
                        title="Sync all active orders with Shiprocket"
                    >
                        <Zap size={16} />
                        {syncingAll ? 'Syncing...' : 'Sync All Active'}
                    </button>
                    {lastSynced && (
                        <span className={styles.lastSynced}>
                            <Clock size={12} />
                            Last sync: {lastSynced.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className={styles.statsGrid}>
                    {statCards.map((card, i) => (
                        <motion.div
                            key={card.label}
                            className={styles.statCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div className={styles.statIcon} style={{ background: `${card.color}15`, color: card.color }}>
                                <card.icon size={22} />
                            </div>
                            <div className={styles.statContent}>
                                <h3>{card.value}</h3>
                                <p>{card.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by order number, customer name, phone..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <Filter size={16} />
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'].map(status => (
                        <button
                            key={status}
                            className={`${styles.filterBtn} ${filter === status ? styles.filterActive : ''}`}
                            onClick={() => { setFilter(status); setPage(1) }}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Shipment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className={styles.loadingCell}>
                                    <RefreshCw size={24} className={styles.spinner} />
                                    Loading orders...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={styles.emptyCell}>
                                    <Package size={48} />
                                    <p>No orders found</p>
                                </td>
                            </tr>
                        ) : (
                            orders.map(order => {
                                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                                const StatusIcon = statusConfig.icon

                                return (
                                    <tr key={order._id} className={styles.tableRow}>
                                        <td>
                                            <div className={styles.orderCell}>
                                                <strong>#{order.orderNumber}</strong>
                                                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.customerCell}>
                                                <strong>{order.shippingAddress?.name || 'Guest'}</strong>
                                                <span>{order.shippingAddress?.phone || order.guestEmail || ''}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <strong>₹{order.total?.toLocaleString()}</strong>
                                        </td>
                                        <td>
                                            <span className={`${styles.paymentBadge} ${order.payment?.method === 'cod' ? styles.cod : styles.prepaid}`}>
                                                {order.payment?.method === 'cod' ? 'COD' : 'Prepaid'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.statusBadge} style={{ backgroundColor: statusConfig.color }}>
                                                <StatusIcon size={12} />
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td>
                                            {order.shiprocket?.awbCode ? (
                                                <div className={styles.shipmentCell}>
                                                    <span className={styles.awb}>{order.shiprocket.awbCode}</span>
                                                    <span className={styles.courier}>{order.shiprocket.courierName}</span>
                                                </div>
                                            ) : (
                                                <span className={styles.noShipment}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.actionCell}>
                                                <button onClick={() => openDetail(order)} className={styles.iconBtn} title="View Details">
                                                    <Eye size={16} />
                                                </button>
                                                {order.shiprocket?.awbCode && (
                                                    <>
                                                        <button
                                                            onClick={() => handleRefreshOrder(order)}
                                                            className={`${styles.iconBtn} ${refreshingOrderId === order._id ? styles.spinning : ''}`}
                                                            title="Refresh tracking"
                                                            disabled={refreshingOrderId === order._id}
                                                        >
                                                            <RefreshCw size={16} />
                                                        </button>
                                                        <button onClick={() => handleTrackOrder(order)} className={styles.iconBtn} title="Track">
                                                            <Truck size={16} />
                                                        </button>
                                                        <button onClick={() => handleDownloadLabel(order)} className={styles.iconBtn} title="Label">
                                                            <Download size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className={styles.pagination}>
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className={styles.pageBtn}
                    >
                        <ChevronLeft size={18} /> Prev
                    </button>
                    <span className={styles.pageInfo}>
                        Page {page} of {pagination.pages}
                    </span>
                    <button
                        disabled={page >= pagination.pages}
                        onClick={() => setPage(p => p + 1)}
                        className={styles.pageBtn}
                    >
                        Next <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* Order Detail Modal */}
            <AnimatePresence>
                {detailOpen && selectedOrder && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDetailOpen(false)}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h2>Order #{selectedOrder.orderNumber}</h2>
                                <button onClick={() => setDetailOpen(false)} className={styles.closeBtn}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                {/* Status & Total */}
                                <div className={styles.modalSummary}>
                                    <div className={styles.modalStatus} style={{ backgroundColor: STATUS_CONFIG[selectedOrder.status]?.color }}>
                                        {selectedOrder.status}
                                    </div>
                                    <div className={styles.modalTotal}>
                                        ₹{selectedOrder.total?.toLocaleString()}
                                    </div>
                                </div>

                                {/* Customer */}
                                <div className={styles.modalSection}>
                                    <h4><Users size={16} /> Customer</h4>
                                    <p><strong>{selectedOrder.shippingAddress?.name}</strong></p>
                                    <p>{selectedOrder.shippingAddress?.phone}</p>
                                    <p>{selectedOrder.shippingAddress?.line1}</p>
                                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}</p>
                                </div>

                                {/* Items */}
                                <div className={styles.modalSection}>
                                    <h4><Package size={16} /> Items</h4>
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className={styles.modalItem}>
                                            <span>{item.name}</span>
                                            <span>×{item.quantity}</span>
                                            <strong>₹{item.price?.toLocaleString()}</strong>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipment */}
                                {selectedOrder.shiprocket?.awbCode && (
                                    <div className={styles.modalSection}>
                                        <h4><Truck size={16} /> Shipment</h4>
                                        <div className={styles.modalShipment}>
                                            <div>
                                                <span>AWB:</span>
                                                <strong>{selectedOrder.shiprocket.awbCode}</strong>
                                            </div>
                                            <div>
                                                <span>Courier:</span>
                                                <strong>{selectedOrder.shiprocket.courierName}</strong>
                                            </div>
                                            <div>
                                                <span>Status:</span>
                                                <strong>{selectedOrder.shiprocket.pickupStatus}</strong>
                                            </div>
                                        </div>
                                        <div className={styles.modalActions}>
                                            <a
                                                href={`https://shiprocket.co/tracking/${selectedOrder.shiprocket.awbCode}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.modalBtn}
                                            >
                                                <ExternalLink size={14} /> Track on Shiprocket
                                            </a>
                                            {selectedOrder.shiprocket.labelUrl && (
                                                <a
                                                    href={selectedOrder.shiprocket.labelUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.modalBtnSecondary}
                                                >
                                                    <Download size={14} /> Download Label
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Timeline */}
                                <div className={styles.modalSection}>
                                    <h4><Calendar size={16} /> Timeline</h4>
                                    <div className={styles.modalTimeline}>
                                        {selectedOrder.timeline?.map((t, i) => (
                                            <div key={i} className={styles.modalTimelineItem}>
                                                <div className={styles.modalTimelineDot} />
                                                <div>
                                                    <strong>{t.status}</strong>
                                                    <p>{t.note}</p>
                                                    <small>{new Date(t.timestamp).toLocaleString('en-IN')}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
