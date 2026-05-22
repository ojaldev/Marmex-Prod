'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Package, Briefcase, Star, MessageSquare, FolderOpen, Home, Settings, LogOut, ShoppingCart, RotateCcw, Truck, BarChart3 } from 'lucide-react'
import styles from './admin.module.css'

export default function AdminLayout({ children }) {
    const pathname = usePathname()
    const router = useRouter()
    const [counts, setCounts] = useState({ products: 0, projects: 0, testimonials: 0, orders: 0 })

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [productsData, projectsData, testimonialsData, ordersData] = await Promise.all([
                    fetch('/api/products').then(r => r.json()),
                    fetch('/api/projects').then(r => r.json()),
                    fetch('/api/testimonials').then(r => r.json()),
                    fetch('/api/admin/orders?limit=1').then(r => r.json()).catch(() => ({ stats: {} }))
                ])

                const products = productsData.products || productsData
                const projects = projectsData.projects || projectsData
                const testimonials = testimonialsData || testimonialsData

                setCounts({
                    products: products.length,
                    projects: projects.length,
                    testimonials: testimonials.length,
                    orders: ordersData.stats?.totalOrders || 0
                })
            } catch (error) {
                console.error('Failed to fetch counts:', error)
            }
        }
        fetchCounts()
    }, [pathname])

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/admin/login')
            router.refresh()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const navItems = [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/admin/orders', icon: ShoppingCart, label: 'Orders', count: counts.orders },
        { href: '/admin/shipments', icon: Truck, label: 'Shipments' },
        { href: '/admin/returns', icon: RotateCcw, label: 'Returns' },
        { href: '/admin/couriers', icon: BarChart3, label: 'Couriers' },
        { href: '/admin/products', icon: Package, label: 'Products', count: counts.products },
        { href: '/admin/categories', icon: FolderOpen, label: 'Categories' },
        { href: '/admin/projects', icon: Briefcase, label: 'Portfolio', count: counts.projects },
        { href: '/admin/testimonials', icon: Star, label: 'Testimonials', count: counts.testimonials },
        { href: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
        { href: '/admin/homepage', icon: Home, label: 'Homepage' },
        { href: '/admin/settings', icon: Settings, label: 'Settings' }
    ]

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>Marmex CMS</h2>
                </div>
                <nav className={styles.nav}>
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                            {item.count !== undefined && <span className={styles.badge}>{item.count}</span>}
                        </Link>
                    ))}
                </nav>
                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    )
}
