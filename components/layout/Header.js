'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShoppingCart, Heart, Menu, X, ChevronDown, User, ArrowRight
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import MiniCart from '@/components/cart/MiniCart'
import { navDropdown, fadeIn } from '@/lib/animations'
import styles from './Header.module.css'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { getCartCount, setIsCartOpen } = useCart()
  const { getWishlistCount } = useWishlist()
  const cartCount = getCartCount()
  const wishlistCount = getWishlistCount()

  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchInputRef = useRef(null)
  const searchDebounce = useRef(null)

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  // Debounced search
  const handleSearchInput = useCallback((value) => {
    setSearchQuery(value)
    clearTimeout(searchDebounce.current)

    if (!value.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        const products = data.products || data
        const query = value.toLowerCase()
        const filtered = products
          .filter(p =>
            p.name?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query) ||
            p.tags?.some(t => t.toLowerCase().includes(query))
          )
          .slice(0, 5)
        setSearchResults(filtered)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

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
          <Image
            src="/logo.png"
            alt="Marmex India"
            width={50}
            height={50}
            className={styles.logoImage}
            priority
          />
          <div className={styles.logoText}>
            <h1>MARMEX</h1>
            <span>India</span>
          </div>
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
                {item.dropdown && (
                  <ChevronDown
                    size={16}
                    className={styles.chevron}
                    style={{ transform: activeDropdown === item.label ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                )}
              </Link>

              {/* Animated Dropdown */}
              <AnimatePresence>
                {item.dropdown && activeDropdown === item.label && (
                  <motion.div
                    className={styles.dropdown}
                    variants={navDropdown}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className={styles.dropdownContent}>
                      {item.dropdown.map((subItem, i) => (
                        <motion.div
                          key={subItem.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Link href={subItem.href} className={styles.dropdownItem}>
                            {subItem.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <motion.button
            className={styles.actionBtn}
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={20} />
          </motion.button>

          <Link href="/account/wishlist" className={styles.actionBtn} aria-label="Wishlist">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Heart size={20} />
            </motion.div>
            {wishlistCount > 0 && (
              <motion.span
                className={styles.badge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={wishlistCount}
              >
                {wishlistCount}
              </motion.span>
            )}
          </Link>

          {session ? (
            <Link href="/account" className={styles.actionBtn} aria-label="My Account">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <User size={20} />
              </motion.div>
            </Link>
          ) : (
            <Link href="/auth/login" className={styles.actionBtn} aria-label="Login">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <User size={20} />
              </motion.div>
            </Link>
          )}

          <motion.button
            className={styles.actionBtn}
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping cart"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <motion.span
                className={styles.badge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={cartCount}
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>

          <motion.button
            className={`${styles.actionBtn} ${styles.mobileMenuBtn}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className={styles.searchOverlay}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className={styles.searchContainer}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search size={24} className={styles.searchIcon} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for marble art, sculptures, gifts..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className={styles.searchClose}
                  onClick={() => {
                    setSearchOpen(false)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  aria-label="Close search"
                >
                  <X size={24} />
                </button>
              </form>

              {/* Search Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    className={styles.searchResults}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {searchResults.map((product) => (
                      <Link
                        key={product._id || product.id}
                        href={`/products/${product._id || product.id}`}
                        className={styles.searchResultItem}
                        onClick={() => {
                          setSearchOpen(false)
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                      >
                        <div className={styles.searchResultImage}>
                          {product.mainImage ? (
                            <Image
                              src={product.mainImage}
                              alt={product.name}
                              width={50}
                              height={50}
                              className="object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-[var(--color-pearl)] rounded-md" />
                          )}
                        </div>
                        <div className={styles.searchResultInfo}>
                          <p className={styles.searchResultName}>{product.name}</p>
                          <p className={styles.searchResultPrice}>
                            ₹{(product.discount > 0
                              ? product.price * (100 - product.discount) / 100
                              : product.price
                            )?.toLocaleString()}
                          </p>
                        </div>
                        <ArrowRight size={16} className="text-[var(--color-gold-24k)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className={styles.searchViewAll}
                    >
                      View all results for "{searchQuery}"
                      <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}
                {searchQuery && !searchLoading && searchResults.length === 0 && (
                  <motion.div
                    className={styles.searchNoResults}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No products found for "{searchQuery}"
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
          >
            <nav className={styles.mobileNav}>
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
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
                </motion.div>
              ))}

              <div className={styles.mobileMenuDivider} />
              {session ? (
                <>
                  <Link href="/account" className={styles.mobileNavItem}>My Account</Link>
                  <Link href="/account/orders" className={styles.mobileNavItem}>My Orders</Link>
                  <Link href="/account/wishlist" className={styles.mobileNavItem}>Wishlist</Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className={styles.mobileNavItem}>Login</Link>
                  <Link href="/auth/register" className={styles.mobileNavItem}>Register</Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <MiniCart />
    </header>
  )
}
