'use client'

import { useEffect, useState } from 'react'
import { Package, FileText, MessageSquare, TrendingUp } from 'lucide-react'
import styles from './dashboard.module.css'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        products: 0,
        projects: 0,
        testimonials: 0,
        recentProducts: []
    })

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/projects').then(r => r.json()),
            fetch('/api/testimonials').then(r => r.json()),
        ]).then(([productsData, projectsData, testimonialsData]) => {
            // Handle new MongoDB API format
            const products = productsData.products || productsData
            const projects = projectsData.projects || projectsData
            const testimonials = testimonialsData || testimonialsData

            setStats({
                products: products.length,
                projects: projects.length,
                testimonials: testimonials.length,
                recentProducts: products.slice(-5).reverse()
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
                        <Package size={24} color="var(--color-secondary)" />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.products}</h3>
                        <p>Total Products</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(26, 26, 26, 0.05)' }}>
                        <FileText size={24} color="var(--color-primary)" />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.projects}</h3>
                        <p>Portfolio Items</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                        <MessageSquare size={24} color="var(--color-secondary)" />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.testimonials}</h3>
                        <p>Testimonials</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(26, 26, 26, 0.05)' }}>
                        <TrendingUp size={24} color="var(--color-primary)" />
                    </div>
                    <div className={styles.statContent}>
                        <h3>Active</h3>
                        <p>System Status</p>
                    </div>
                    <h3>Manage Homepage</h3>
                    <p>Update hero banner and content</p>
                </div>
            </div>


            {
                stats.recentProducts.length > 0 && (
                    <div className={styles.recentSection}>
                        <h2>Recently Added Products</h2>
                        <div className={styles.recentList}>
                            {stats.recentProducts.map(product => (
                                <div key={product.id} className={`${styles.recentItem} card`}>
                                    <div className={styles.recentInfo}>
                                        <h4>{product.name}</h4>
                                        <p>{product.category}</p>
                                    </div>
                                    <Link href={`/admin/products/${product.id}`} className="btn btn-outline btn-sm">Edit</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    )
}
