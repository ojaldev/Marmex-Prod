'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Truck, TrendingUp, Award, AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react'
import styles from './couriers.module.css'

export default function AdminCouriersPage() {
    const [couriers, setCouriers] = useState([])
    const [orders, setOrders] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch courier stats + a batch of orders for detailed analysis
            const [ordersRes] = await Promise.all([
                fetch('/api/admin/orders?limit=1').then(r => r.json())
            ])

            const courierStats = ordersRes.courierStats || []
            setCouriers(courierStats)
            setStats(ordersRes.stats || {})

            // Fetch some orders to compute additional per-courier metrics
            const allOrdersRes = await fetch('/api/admin/orders?limit=200').then(r => r.json())
            const allOrders = allOrdersRes.orders || []
            setOrders(allOrders)
        } catch (err) {
            console.error('Fetch couriers error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Compute enhanced courier metrics from orders
    const enhancedCouriers = couriers.map(c => {
        const courierOrders = orders.filter(o =>
            o.shiprocket?.courierName === c.name
        )

        const delivered = courierOrders.filter(o => o.status === 'delivered').length
        const inTransit = courierOrders.filter(o => o.status === 'shipped').length
        const failed = courierOrders.filter(o =>
            ['cancelled', 'returned'].includes(o.status)
        ).length

        const deliveryRate = c.count > 0 ? Math.round((delivered / c.count) * 100) : 0

        // Estimate avg delivery time (days between shipped and delivered)
        let totalDays = 0
        let deliveredCount = 0
        courierOrders.forEach(o => {
            if (o.status === 'delivered' && o.timeline?.length >= 2) {
                const shipped = o.timeline.find(t => t.status === 'shipped')
                const delivered = o.timeline.find(t => t.status === 'delivered')
                if (shipped && delivered) {
                    const days = (new Date(delivered.timestamp) - new Date(shipped.timestamp)) / (1000 * 60 * 60 * 24)
                    if (days > 0 && days < 30) {
                        totalDays += days
                        deliveredCount++
                    }
                }
            }
        })
        const avgDays = deliveredCount > 0 ? Math.round(totalDays / deliveredCount) : null

        return {
            ...c,
            delivered,
            inTransit,
            failed,
            deliveryRate,
            avgDays
        }
    }).sort((a, b) => b.deliveryRate - a.deliveryRate)

    const bestCourier = enhancedCouriers.length > 0
        ? enhancedCouriers.reduce((best, c) => c.deliveryRate > best.deliveryRate ? c : best)
        : null

    const worstCourier = enhancedCouriers.length > 0
        ? enhancedCouriers.reduce((worst, c) => c.deliveryRate < worst.deliveryRate ? c : worst)
        : null

    const avgRate = enhancedCouriers.length > 0
        ? Math.round(enhancedCouriers.reduce((sum, c) => sum + c.deliveryRate, 0) / enhancedCouriers.length)
        : 0

    const summaryStats = [
        { label: 'Active Couriers', value: enhancedCouriers.length, icon: Truck, color: '#6b7280' },
        { label: 'Avg Delivery Rate', value: `${avgRate}%`, icon: TrendingUp, color: '#3b82f6' },
        { label: 'Best Performer', value: bestCourier?.name?.split(' ')[0] || '-', icon: Award, color: '#10b981' },
        { label: 'Needs Attention', value: worstCourier?.name?.split(' ')[0] || '-', icon: AlertTriangle, color: '#f59e0b' },
    ]

    const getRateColor = (rate) => {
        if (rate >= 90) return '#10b981'
        if (rate >= 75) return '#3b82f6'
        if (rate >= 60) return '#f59e0b'
        return '#ef4444'
    }

    const getRateLabel = (rate) => {
        if (rate >= 90) return 'Excellent'
        if (rate >= 75) return 'Good'
        if (rate >= 60) return 'Average'
        return 'Poor'
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Courier Performance</h1>
                <p>Analytics and performance metrics for all shipping partners</p>
            </div>

            {/* Summary Stats */}
            <div className={styles.statsGrid}>
                {summaryStats.map((s, i) => (
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
                <button className={styles.refreshBtn} onClick={fetchData} disabled={loading} title="Refresh">
                    <RefreshCw size={16} className={loading ? styles.spinner : ''} />
                    Refresh
                </button>
            </div>

            {/* Courier Cards */}
            {loading ? (
                <div className={styles.loading}>
                    <RefreshCw size={32} className={styles.spinner} />
                    <p>Loading courier analytics...</p>
                </div>
            ) : enhancedCouriers.length === 0 ? (
                <div className={styles.empty}>
                    <Truck size={48} />
                    <p>No courier data yet. Create some shipments first.</p>
                </div>
            ) : (
                <div className={styles.courierGrid}>
                    {enhancedCouriers.map((courier, i) => {
                        const rateColor = getRateColor(courier.deliveryRate)
                        return (
                            <div key={i} className={styles.courierCard}>
                                <div className={styles.courierHeader}>
                                    <div className={styles.courierRank} style={{ background: rateColor }}>
                                        #{i + 1}
                                    </div>
                                    <div className={styles.courierTitle}>
                                        <h3>{courier.name}</h3>
                                        <span className={styles.rateLabel} style={{ color: rateColor }}>
                                            {getRateLabel(courier.deliveryRate)}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.courierRate}>
                                    <div className={styles.rateNumber} style={{ color: rateColor }}>
                                        {courier.deliveryRate}%
                                    </div>
                                    <div className={styles.rateBarBg}>
                                        <div
                                            className={styles.rateBarFill}
                                            style={{ width: `${courier.deliveryRate}%`, background: rateColor }}
                                        />
                                    </div>
                                </div>

                                <div className={styles.courierMetrics}>
                                    <div className={styles.metric}>
                                        <Package size={14} />
                                        <span>{courier.count} shipments</span>
                                    </div>
                                    <div className={styles.metric}>
                                        <CheckCircle size={14} />
                                        <span>{courier.delivered} delivered</span>
                                    </div>
                                    <div className={styles.metric}>
                                        <Truck size={14} />
                                        <span>{courier.inTransit} in transit</span>
                                    </div>
                                    <div className={styles.metric}>
                                        <AlertTriangle size={14} />
                                        <span>{courier.failed} failed</span>
                                    </div>
                                    {courier.avgDays && (
                                        <div className={styles.metric}>
                                            <Clock size={14} />
                                            <span>~{courier.avgDays} day avg</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Detailed Table */}
            {!loading && enhancedCouriers.length > 0 && (
                <div className={styles.tableSection}>
                    <h2>Performance Breakdown</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Courier</th>
                                    <th>Total Shipments</th>
                                    <th>Delivered</th>
                                    <th>In Transit</th>
                                    <th>Failed</th>
                                    <th>Delivery Rate</th>
                                    <th>Avg Time</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enhancedCouriers.map((c, i) => {
                                    const rateColor = getRateColor(c.deliveryRate)
                                    return (
                                        <tr key={i}>
                                            <td>
                                                <span className={styles.rankBadge} style={{ background: rateColor }}>
                                                    #{i + 1}
                                                </span>
                                            </td>
                                            <td><strong>{c.name}</strong></td>
                                            <td>{c.count}</td>
                                            <td>{c.delivered}</td>
                                            <td>{c.inTransit}</td>
                                            <td>{c.failed}</td>
                                            <td>
                                                <span className={styles.rateBadge} style={{ background: `${rateColor}20`, color: rateColor }}>
                                                    {c.deliveryRate}%
                                                </span>
                                            </td>
                                            <td>{c.avgDays ? `~${c.avgDays}d` : '-'}</td>
                                            <td>
                                                <span style={{ color: rateColor, fontWeight: 700 }}>
                                                    {getRateLabel(c.deliveryRate)}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
