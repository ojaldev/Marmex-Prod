'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, ShoppingCart, Heart, Menu, X, ChevronDown, User } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import MiniCart from '@/components/cart/MiniCart'
import styles from './Header.module.css'

export default function Header() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { getCartCount, setIsCartOpen } = useCart()
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [searchOpen, setSearchOpen] = useState(false)
    const [wishlistCount, setWishlistCount] = useState(0)
    const cartCount = getCartCount()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    const navItems = [
        {
            label: 'Shop',
            href: '/products',
            dropdown: [
                { label: 'All Products', href: '/products' },
                { label: 'Sculptures & Art', href: '/products?category=Sculptures' },
                { label: 'Dining Décor', href: '/products?category=Dining' },
                { label: 'Wall Art', href: '/products?category=Wall Art' },
                { label: 'Personalized Gifts', href: '/products?category=Gifts' },
                { label: 'Marble Games', href: '/products?category=Games' },
            ]
        },
        { label: 'Custom Orders', href: '/custom' },
        { label: 'Portfolio', href: '/projects' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
    ]

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.headerContainer}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <h1>MARMEX</h1>
                    <span>India</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className={styles.desktopNav}>
                    {navItems.map((item) => (
                        <div
                            key={item.label}
                            className={styles.navItemWrapper}
                            onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <Link
                                href={item.href}
                                className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                            >
                                {item.label}
                                {item.dropdown && <ChevronDown size={16} className={styles.chevron} />}
                            </Link>

                            {/* Dropdown Menu */}
                            {item.dropdown && activeDropdown === item.label && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownContent}>
                                        {item.dropdown.map((subItem) => (
                                            <Link
                                                key={subItem.label}
                                                href={subItem.href}
                                                className={styles.dropdownItem}
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Actions */}
                <div className={styles.actions}>
                    {/* Search */}
                    <button
                        className={styles.actionBtn}
                        onClick={() => setSearchOpen(!searchOpen)}
                        aria-label="Search"
                    >
                        <Search size={20} />
                    </button>

                    {/* Wishlist */}
                    <Link href="/account/wishlist" className={styles.actionBtn} aria-label="Wishlist">
                        <Heart size={20} />
                        {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
                    </Link>

                    {/* Account / Login */}
                    {session ? (
                        <Link href="/account" className={styles.actionBtn} aria-label="My Account">
                            <User size={20} />
                        </Link>
                    ) : (
                        <Link href="/auth/login" className={styles.actionBtn} aria-label="Login">
                            <User size={20} />
                        </Link>
                    )}

                    {/* Cart */}
                    <button
                        className={styles.actionBtn}
                        onClick={() => setIsCartOpen(true)}
                        aria-label="Shopping cart"
                    >
                        <ShoppingCart size={20} />
                        {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`${styles.actionBtn} ${styles.mobileMenuBtn}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Search Overlay */}
            {searchOpen && (
                <div className={styles.searchOverlay}>
                    <div className={styles.searchContainer}>
                        <Search size={24} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search for marble art, sculptures, gifts..."
                            className={styles.searchInput}
                            autoFocus
                        />
                        <button
                            className={styles.searchClose}
                            onClick={() => setSearchOpen(false)}
                            aria-label="Close search"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <nav className={styles.mobileNav}>
                        {navItems.map((item) => (
                            <div key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`${styles.mobileNavItem} ${pathname === item.href ? styles.active : ''}`}
                                >
                                    {item.label}
                                </Link>
                                {item.dropdown && (
                                    <div className={styles.mobileDropdown}>
                                        {item.dropdown.map((subItem) => (
                                            <Link
                                                key={subItem.label}
                                                href={subItem.href}
                                                className={styles.mobileDropdownItem}
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Account / Login in Mobile Menu */}
                        <div className={styles.mobileMenuDivider} />
                        {session ? (
                            <>
                                <Link href="/account" className={styles.mobileNavItem}>
                                    My Account
                                </Link>
                                <Link href="/account/orders" className={styles.mobileNavItem}>
                                    My Orders
                                </Link>
                                <Link href="/account/wishlist" className={styles.mobileNavItem}>
                                    Wishlist
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className={styles.mobileNavItem}>
                                    Login
                                </Link>
                                <Link href="/auth/register" className={styles.mobileNavItem}>
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            )}

            {/* Mini Cart */}
            <MiniCart />
        </header>
    )
}
