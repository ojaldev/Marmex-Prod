'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Package, Briefcase, Star, Home, Settings, LogOut } from 'lucide-react'
import styles from './admin.module.css'

export default function AdminLayout({ children }) {
    const pathname = usePathname()
    const router = useRouter()
    const [counts, setCounts] = useState({ products: 0, projects: 0, testimonials: 0 })

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [productsData, projectsData, testimonialsData] = await Promise.all([
                    fetch('/api/products').then(r => r.json()),
                    fetch('/api/projects').then(r => r.json()),
                    fetch('/api/testimonials').then(r => r.json())
                ])

                // Handle new MongoDB API format
                const products = productsData.products || productsData
                const projects = projectsData.projects || projectsData
                const testimonials = testimonialsData || testimonialsData

                setCounts({
                    products: products.length,
                    projects: projects.length,
                    testimonials: testimonials.length
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
        { href: '/admin/products', icon: Package, label: 'Products', count: counts.products },
        { href: '/admin/projects', icon: Briefcase, label: 'Portfolio', count: counts.projects },
        { href: '/admin/testimonials', icon: Star, label: 'Testimonials', count: counts.testimonials },
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
