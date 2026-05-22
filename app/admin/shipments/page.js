'use client'

import { useEffect, useState } from 'react'
import { Search, RefreshCw, Truck, Package, CheckCircle, MapPin, ExternalLink, Download, Loader2, AlertCircle } from 'lucide-react'
import styles from './shipments.module.css'

const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipped: '#3b82f6',
    delivered: '#10b981',
    cancelled: '#ef4444',
    returned: '#6b7280'
}

export default function AdminShipmentsPage() {
    const [shipments, setShipments] = useState([])
    const [stats, setStats] = useState({})
    const [pagination, setPagination] = useState({ page: 1, pages: 1 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const fetchShipments = async (page = 1) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.set('page', String(page))
            params.set('limit', '25')
            if (search.trim()) params.set('search', search.trim())

            const res = await fetch(`/api/admin/orders?${params}`)
            const data = await res.json()

            if (res.ok) {
                // Only show orders that have Shiprocket data
                const withShipment = (data.orders || []).filter(o =>
                    o.shiprocket?.awbCode || o.shiprocket?.shipmentId
                )
                setShipments(withShipment)
                setStats(data.stats || {})
                setPagination(data.pagination || { page: 1, pages: 1 })
            }
        } catch (err) {
            console.error('Fetch shipments error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchShipments(1)
    }, [search])

    const handleSearch = (e) => {
        if (e.key === 'Enter') fetchShipments(1)
    }

    const handleRefresh = () => fetchShipments(pagination.page)

    const formatDate = (d) => {
        if (!d) return '-'
        return new Date(d).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    const shipmentStats = [
        { label: 'Total', value: shipments.length, icon: Package, color: '#6b7280' },
        { label: 'In Transit', value: shipments.filter(s => s.status === 'shipped').length, icon: Truck, color: '#3b82f6' },
        { label: 'Delivered', value: shipments.filter(s => s.status === 'delivered').length, icon: CheckCircle, color: '#10b981' },
        { label: 'Pending Pickup', value: shipments.filter(s => s.status === 'processing').length, icon: AlertCircle, color: '#f59e0b' },
    ]

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Shipments</h1>
                <p>Track and manage all Shiprocket shipments</p>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                {shipmentStats.map((s, i) => (
                    <div key={i} className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: `${s.color}15` }}>
                            <s.icon size={20} color={s.color} />
                        </div>
                        <div className={styles.statContent}>
                            <h3>{s.value}</h3>
                            <p>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by order # or AWB..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
                <button className={styles.refreshBtn} onClick={handleRefresh} title="Refresh">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>AWB</th>
                            <th>Courier</th>
                            <th>Status</th>
                            <th>Pickup</th>
                            <th>Destination</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className={styles.loadingCell}>
                                    <Loader2 size={32} className={styles.spinner} />
                                    <p>Loading shipments...</p>
                                </td>
                            </tr>
                        ) : shipments.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={styles.emptyCell}>
                                    <Truck size={48} />
                                    <p>No shipments found</p>
                                </td>
                            </tr>
                        ) : (
                            shipments.map(order => (
                                <tr key={order._id}>
                                    <td className={styles.orderCell}>
                                        <strong>{order.orderNumber}</strong>
                                        <span>{order.items?.length} item(s)</span>
                                    </td>
                                    <td>
                                        <span className={styles.awb}>{order.shiprocket?.awbCode || '-'}</span>
                                    </td>
                                    <td>{order.shiprocket?.courierName || '-'}</td>
                                    <td>
                                        <span
                                            className={styles.statusBadge}
                                            style={{ background: STATUS_COLORS[order.status] || '#6b7280' }}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.pickupBadge}>
                                            {order.shiprocket?.pickupScheduled
                                                ? formatDate(order.shiprocket.pickupScheduled)
                                                : order.shiprocket?.pickupStatus || 'Pending'
                                            }
                                        </span>
                                    </td>
                                    <td className={styles.destinationCell}>
                                        <MapPin size={14} />
                                        <span>{order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                                    </td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td className={styles.actionCell}>
                                        {order.shiprocket?.awbCode && (
                                            <a
                                                href={`https://shiprocket.co/tracking/${order.shiprocket.awbCode}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.iconBtn}
                                                title="Track"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                        {order.shiprocket?.labelUrl && (
                                            <a
                                                href={order.shiprocket.labelUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.iconBtn}
                                                title="Label"
                                            >
                                                <Download size={14} />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        disabled={pagination.page <= 1}
                        onClick={() => fetchShipments(pagination.page - 1)}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>Page {pagination.page} of {pagination.pages}</span>
                    <button
                        className={styles.pageBtn}
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => fetchShipments(pagination.page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
