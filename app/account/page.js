'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { User, Package, Heart, MapPin, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import styles from './account.module.css'

export default function AccountPage() {
    const { data: session } = useSession()

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' })
    }

    return (
        <div className={styles.accountPage}>
            <div className="container">
                <div className={styles.header}>
                    <h1>My Account</h1>
                    <p>Welcome back, {session?.user?.name}!</p>
                </div>

                <div className={styles.grid}>
                    {/* Profile Card */}
                    <Link href="/account/profile" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <User size={32} />
                        </div>
                        <h2>Profile</h2>
                        <p>Manage your personal information</p>
                    </Link>

                    {/* Orders Card */}
                    <Link href="/account/orders" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <Package size={32} />
                        </div>
                        <h2>Orders</h2>
                        <p>View order history and track shipments</p>
                    </Link>

                    {/* Wishlist Card */}
                    <Link href="/account/wishlist" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <Heart size={32} />
                        </div>
                        <h2>Wishlist</h2>
                        <p>Your saved favorite items</p>
                    </Link>

                    {/* Addresses Card */}
                    <Link href="/account/addresses" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <MapPin size={32} />
                        </div>
                        <h2>Addresses</h2>
                        <p>Manage delivery addresses</p>
                    </Link>

                    {/* Settings Card */}
                    <Link href="/account/settings" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <Settings size={32} />
                        </div>
                        <h2>Settings</h2>
                        <p>Account settings and preferences</p>
                    </Link>

                    {/* Logout Card */}
                    <button onClick={handleSignOut} className={`${styles.card} ${styles.logoutCard}`}>
                        <div className={styles.cardIcon}>
                            <LogOut size={32} />
                        </div>
                        <h2>Sign Out</h2>
                        <p>Logout from your account</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
