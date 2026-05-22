'use client'

import { useEffect, useState } from 'react'
import { Search, RefreshCw, Package, CheckCircle, XCircle, Truck, RotateCcw, Eye, Loader2, Calendar, User } from 'lucide-react'
import styles from './returns.module.css'

const STATUS_COLORS = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    picked_up: '#3b82f6',
    processing: '#8b5cf6',
    completed: '#10b981',
    cancelled: '#6b7280'
}

const STATUS_LABELS = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    picked_up: 'Picked Up',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled'
}

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed', label: 'Completed' }
]

export default function AdminReturnsPage() {
    const [returns, setReturns] = useState([])
    const [counts, setCounts] = useState({})
    const [pagination, setPagination] = useState({ page: 1, pages: 1 })
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedReturn, setSelectedReturn] = useState(null)
    const [updating, setUpdating] = useState(false)

    const fetchReturns = async (page = 1) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.set('page', String(page))
            params.set('limit', '20')
            if (statusFilter !== 'all') params.set('status', statusFilter)
            if (search.trim()) params.set('search', search.trim())

            const res = await fetch(`/api/admin/returns?${params}`)
            const data = await res.json()

            if (res.ok) {
                setReturns(data.returns || [])
                setCounts(data.counts || {})
                setPagination(data.pagination || { page: 1, pages: 1 })
            }
        } catch (err) {
            console.error('Fetch returns error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReturns(1)
    }, [statusFilter, search])

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchReturns(1)
        }
    }

    const openDetail = (ret) => {
        setSelectedReturn(ret)
        setDetailOpen(true)
    }

    const updateStatus = async (newStatus) => {
        if (!selectedReturn) return
        setUpdating(true)
        try {
            const res = await fetch(`/api/returns/${selectedReturn._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                await fetchReturns(pagination.page)
                setDetailOpen(false)
                setSelectedReturn(null)
            }
        } catch (err) {
            console.error('Update status error:', err)
        } finally {
            setUpdating(false)
        }
    }

    const formatDate = (d) => {
        if (!d) return '-'
        return new Date(d).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    const formatCurrency = (n) => {
        if (n == null) return '-'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(n)
    }

    const stats = [
        { label: 'Total', value: counts.total || 0, icon: Package, color: '#6b7280' },
        { label: 'Pending', value: counts.pending || 0, icon: RotateCcw, color: '#f59e0b' },
        { label: 'Approved', value: counts.approved || 0, icon: CheckCircle, color: '#10b981' },
        { label: 'Completed', value: counts.completed || 0, icon: Truck, color: '#3b82f6' },
    ]

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Returns & Exchanges</h1>
                <p>Manage customer return and exchange requests</p>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                {stats.map((s, i) => (
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
                        placeholder="Search by order # or customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
                <div className={styles.filterGroup}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`${styles.filterBtn} ${statusFilter === tab.key ? styles.filterActive : ''}`}
                            onClick={() => setStatusFilter(tab.key)}
                        >
                            {tab.label}
                            {counts[tab.key] > 0 && ` (${counts[tab.key]})`}
                        </button>
                    ))}
                    <button className={styles.refreshBtn} onClick={() => fetchReturns(1)} title="Refresh">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Return ID</th>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Reason</th>
                            <th>Refund</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} className={styles.loadingCell}>
                                    <Loader2 size={32} className={styles.spinner} />
                                    <p>Loading returns...</p>
                                </td>
                            </tr>
                        ) : returns.length === 0 ? (
                            <tr>
                                <td colSpan={9} className={styles.emptyCell}>
                                    <Package size={48} />
                                    <p>No returns found</p>
                                </td>
                            </tr>
                        ) : (
                            returns.map(ret => (
                                <tr key={ret._id}>
                                    <td>
                                        <span className={styles.mono}>{ret._id?.slice(-8).toUpperCase()}</span>
                                    </td>
                                    <td className={styles.orderCell}>
                                        <strong>{ret.orderDoc?.orderNumber || '-'}</strong>
                                        <span>{ret.items?.length} item(s)</span>
                                    </td>
                                    <td className={styles.customerCell}>
                                        <strong>{ret.userDoc?.name || ret.orderDoc?.shippingAddress?.name || 'Guest'}</strong>
                                        <span>{ret.userDoc?.email || ret.orderDoc?.guestEmail || '-'}</span>
                                    </td>
                                    <td>
                                        <span className={`${styles.typeBadge} ${styles[ret.type]}`}>
                                            {ret.type === 'return' ? 'Return' : 'Exchange'}
                                        </span>
                                    </td>
                                    <td className={styles.reasonCell}>
                                        {ret.reason}
                                    </td>
                                    <td>{formatCurrency(ret.refundAmount)}</td>
                                    <td>
                                        <span
                                            className={styles.statusBadge}
                                            style={{ background: STATUS_COLORS[ret.status] }}
                                        >
                                            {STATUS_LABELS[ret.status]}
                                        </span>
                                    </td>
                                    <td>{formatDate(ret.createdAt)}</td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.iconBtn} onClick={() => openDetail(ret)} title="View">
                                            <Eye size={16} />
                                        </button>
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
                        onClick={() => fetchReturns(pagination.page - 1)}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>Page {pagination.page} of {pagination.pages}</span>
                    <button
                        className={styles.pageBtn}
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => fetchReturns(pagination.page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            {detailOpen && selectedReturn && (
                <div className={styles.modalOverlay} onClick={() => setDetailOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Return Request</h2>
                            <button className={styles.closeBtn} onClick={() => setDetailOpen(false)}>
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalSummary}>
                                <span className={styles.modalStatus} style={{ background: STATUS_COLORS[selectedReturn.status] }}>
                                    {STATUS_LABELS[selectedReturn.status]}
                                </span>
                                <strong className={styles.modalTotal}>{formatCurrency(selectedReturn.refundAmount)}</strong>
                            </div>

                            <div className={styles.modalSection}>
                                <h4><Package size={16} /> Items</h4>
                                {(selectedReturn.items || []).map((item, i) => (
                                    <div key={i} className={styles.modalItem}>
                                        <span>{item.productName || item.productId} × {item.quantity}</span>
                                        <span>{item.reason}</span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.modalSection}>
                                <h4><User size={16} /> Customer Info</h4>
                                <p><strong>Name:</strong> {selectedReturn.userDoc?.name || selectedReturn.orderDoc?.shippingAddress?.name || 'Guest'}</p>
                                <p><strong>Email:</strong> {selectedReturn.userDoc?.email || selectedReturn.orderDoc?.guestEmail || '-'}</p>
                                <p><strong>Order:</strong> {selectedReturn.orderDoc?.orderNumber || '-'}</p>
                            </div>

                            <div className={styles.modalSection}>
                                <h4><Calendar size={16} /> Timeline</h4>
                                <div className={styles.modalTimeline}>
                                    {(selectedReturn.timeline || []).map((evt, i) => (
                                        <div key={i} className={styles.modalTimelineItem}>
                                            <div className={styles.modalTimelineDot} />
                                            <strong>{STATUS_LABELS[evt.status] || evt.status}</strong>
                                            <p>{evt.note}</p>
                                            <small>{formatDate(evt.timestamp)}</small>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedReturn.adminNotes && (
                                <div className={styles.modalSection}>
                                    <h4>Admin Notes</h4>
                                    <p>{selectedReturn.adminNotes}</p>
                                </div>
                            )}

                            {selectedReturn.status === 'pending' && (
                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.modalBtn}
                                        onClick={() => updateStatus('approved')}
                                        disabled={updating}
                                    >
                                        {updating ? <Loader2 size={16} className={styles.spinner} /> : <CheckCircle size={16} />}
                                        Approve
                                    </button>
                                    <button
                                        className={`${styles.modalBtn} ${styles.danger}`}
                                        onClick={() => updateStatus('rejected')}
                                        disabled={updating}
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
