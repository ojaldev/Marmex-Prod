'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, FileText, MessageSquare, TrendingUp, Home, ShoppingCart, Truck, CheckCircle } from 'lucide-react'
import styles from './dashboard.module.css'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        products: 0,
        projects: 0,
        testimonials: 0,
        orders: 0,
        shipped: 0,
        delivered: 0,
        recentProducts: [],
        courierStats: []
    })

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/projects').then(r => r.json()),
            fetch('/api/testimonials').then(r => r.json()),
            fetch('/api/admin/orders?limit=1').then(r => r.json()).catch(() => ({ stats: {} }))
        ]).then(([productsData, projectsData, testimonialsData, ordersData]) => {
            const products = productsData.products || productsData
            const projects = projectsData.projects || projectsData
            const testimonials = testimonialsData || testimonialsData
            const orderStats = ordersData.stats || {}
            const courierStats = ordersData.courierStats || []

            setStats({
                products: products.length,
                projects: projects.length,
                testimonials: testimonials.length,
                orders: orderStats.totalOrders || 0,
                shipped: orderStats.shipped || 0,
                delivered: orderStats.delivered || 0,
                recentProducts: products.slice(-5).reverse(),
                courierStats
            })
        })
    }, [])

    return (
        <div>
            <div className={styles.header}>
                <h1>Dashboard</h1>
                <p>Welcome to Marmex India CMS</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                        <ShoppingCart size={24} color="var(--color-secondary)" />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.orders}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                        <Truck size={24} color="#06b6d4" />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.shipped}</h3>
                        <p>Shipped</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <CheckCircle size={24} color="#10b981" />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.delivered}</h3>
                        <p>Delivered</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                        <Package size={24} color="var(--color-secondary)" />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.products}</h3>
                        <p>Total Products</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <Link href="/admin/orders" className={styles.quickAction}>
                    <ShoppingCart size={20} />
                    <div>
                        <h4>Manage Orders</h4>
                        <p>View all orders, tracking, and shipments</p>
                    </div>
                </Link>
                <Link href="/admin/homepage" className={styles.quickAction}>
                    <Home size={20} />
                    <div>
                        <h4>Manage Homepage</h4>
                        <p>Update hero banner and content</p>
                    </div>
                </Link>
            </div>



            {/* Courier Performance */}
            {stats.courierStats?.length > 0 && (
                <div className={styles.recentSection}>
                    <h2>Courier Performance</h2>
                    <div className={styles.courierList}>
                        {stats.courierStats.map((courier, i) => {
                            const deliveryRate = courier.count > 0
                                ? Math.round((courier.delivered / courier.count) * 100)
                                : 0
                            return (
                                <div key={i} className={styles.courierItem}>
                                    <div className={styles.courierInfo}>
                                        <h4>{courier.name}</h4>
                                        <p>{courier.count} shipment{courier.count !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className={styles.courierBar}>
                                        <div
                                            className={styles.courierBarFill}
                                            style={{
                                                width: `${deliveryRate}%`,
                                                background: deliveryRate >= 90 ? '#10b981' : deliveryRate >= 70 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                    <span className={styles.courierRate}>{deliveryRate}% delivered</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {stats.recentProducts.length > 0 && (
                <div className={styles.recentSection}>
                    <h2>Recently Added Products</h2>
                    <div className={styles.recentList}>
                        {stats.recentProducts.map(product => (
                            <div key={product._id || product.id} className={`${styles.recentItem} card`}>
                                <div className={styles.recentInfo}>
                                    <h4>{product.name}</h4>
                                    <p>{product.category}</p>
                                </div>
                                <Link href={`/admin/products/${product._id || product.id}`} className="btn btn-outline btn-sm">Edit</Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

