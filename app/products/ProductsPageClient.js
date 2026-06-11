'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/ui/ProductCard'
import { ProductListSkeleton } from '@/components/ui/SkeletonLoader'
import { Filter, Package, X, SlidersHorizontal, Grid3X3, LayoutGrid, Sparkles } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import styles from './products.module.css'

export default function ProductsPageClient({
    initialProducts = [],
    initialCategories = [],
    initialCategory = 'all',
    initialSearchQuery = ''
}) {
    const router = useRouter()

    const [products] = useState(initialProducts)
    const [categories] = useState(initialCategories)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(initialCategory)
    const [sortBy, setSortBy] = useState('featured')
    const [gridColumns, setGridColumns] = useState(3)
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [priceRange, setPriceRange] = useState([0, 100000])

    // Resolve category param to actual category name
    const resolvedCategoryName = useMemo(() => {
        if (!selectedCategory || selectedCategory === 'all') return 'all'
        const decoded = decodeURIComponent(selectedCategory)
        const exactMatch = categories.find(c => c.name === decoded)
        if (exactMatch) return exactMatch.name
        const slugMatch = categories.find(c => c.slug === decoded)
        if (slugMatch) return slugMatch.name
        const caseMatch = categories.find(c =>
            c.name.toLowerCase() === decoded.toLowerCase()
        )
        if (caseMatch) return caseMatch.name
        return decoded
    }, [selectedCategory, categories])

    // Client-side refresh (optional)
    const refreshData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/categories')
            ])
            if (!productsRes.ok || !categoriesRes.ok) {
                throw new Error('Failed to load products')
            }
            const productsData = await productsRes.json()
            const categoriesData = await categoriesRes.json()
            window.location.reload()
        } catch (err) {
            setError('Unable to load products. Please check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    // Filter and sort
    const filteredProducts = useMemo(() => {
        let result = [...products]

        if (resolvedCategoryName !== 'all') {
            result = result.filter(p =>
                p.category === resolvedCategoryName ||
                p.category?.toLowerCase() === resolvedCategoryName.toLowerCase()
            )
        }

        if (initialSearchQuery) {
            const q = initialSearchQuery.toLowerCase()
            result = result.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.tags?.some(t => t.toLowerCase().includes(q))
            )
        }

        result = result.filter(p => {
            const price = p.discount > 0 ? p.price * (100 - p.discount) / 100 : p.price
            return price >= priceRange[0] && price <= priceRange[1]
        })

        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => (a.price || 0) - (b.price || 0))
                break
            case 'price-high':
                result.sort((a, b) => (b.price || 0) - (a.price || 0))
                break
            case 'name':
                result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                break
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                break
            default: // 'featured'
                result.sort((a, b) => {
                    if (a.featured && !b.featured) return -1
                    if (!a.featured && b.featured) return 1
                    return 0
                })
        }

        return result
    }, [products, resolvedCategoryName, sortBy, initialSearchQuery, priceRange])

    const activeFiltersCount = (resolvedCategoryName !== 'all' ? 1 : 0) + (initialSearchQuery ? 1 : 0)

    const handleCategoryClick = (catName) => {
        if (catName === 'all') {
            setSelectedCategory('all')
            router.replace('/products')
        } else {
            setSelectedCategory(catName)
            router.replace(`/products?category=${encodeURIComponent(catName)}`)
        }
    }

    const clearFilters = () => {
        setSelectedCategory('all')
        setPriceRange([0, 100000])
        router.replace('/products')
    }

    // Filter sidebar content
    const FilterContent = () => (
        <>
            <div className={styles.filterSection}>
                <h3><Filter size={18} /> Categories</h3>
                <div className={styles.filterList}>
                    <button
                        className={selectedCategory === 'all' ? styles.active : ''}
                        onClick={() => handleCategoryClick('all')}
                    >
                        All Products
                        <span className={styles.filterCount}>{products.length}</span>
                    </button>
                    {categories
                        .map(cat => ({ cat, count: products.filter(p => p.category === cat.name).length }))
                        .filter(({ count }) => count > 0)
                        .map(({ cat, count }) => (
                            <button
                                key={cat.id || cat._id}
                                className={resolvedCategoryName === cat.name ? styles.active : ''}
                                onClick={() => handleCategoryClick(cat.name)}
                            >
                                {cat.name}
                                <span className={styles.filterCount}>{count}</span>
                            </button>
                        ))}
                </div>
            </div>

            {activeFiltersCount > 0 && (
                <motion.div
                    className={styles.activeFilters}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <div className={styles.filterChips}>
                        {resolvedCategoryName !== 'all' && (
                            <span className={styles.chip}>
                                {resolvedCategoryName}
                                <button onClick={() => handleCategoryClick('all')}>
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {initialSearchQuery && (
                            <span className={styles.chip}>
                                Search: "{initialSearchQuery}"
                                <button onClick={clearFilters}>
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                    </div>
                    <button className={styles.clearAll} onClick={clearFilters}>
                        Clear all filters
                    </button>
                </motion.div>
            )}
        </>
    )

    return (
        <div className={styles.productsPage}>
            <motion.div
                className={styles.hero}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="container">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        {initialSearchQuery ? `Search: "${initialSearchQuery}"` : 'Our Products'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        {initialSearchQuery
                            ? `Found ${filteredProducts.length} result${filteredProducts.length !== 1 ? 's' : ''}`
                            : 'Discover exquisite handcrafted marble and stone art'
                        }
                    </motion.p>
                </div>
            </motion.div>

            <div className="container">
                <div className={styles.toolbar}>
                    <div className={styles.toolbarLeft}>
                        <h2 className={styles.resultsCount}>
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                        </h2>
                    </div>

                    <div className={styles.toolbarRight}>
                        <div className={styles.sortWrapper}>
                            <SlidersHorizontal size={16} className="text-[var(--color-text-gray)]" />
                            <select
                                className={styles.sortSelect}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="featured">Featured</option>
                                <option value="newest">Newest</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name: A-Z</option>
                            </select>
                        </div>

                        <div className={styles.viewToggle}>
                            <button
                                className={`${styles.viewBtn} ${gridColumns === 2 ? styles.active : ''}`}
                                onClick={() => setGridColumns(2)}
                                aria-label="2 columns"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                className={`${styles.viewBtn} ${gridColumns === 3 ? styles.active : ''}`}
                                onClick={() => setGridColumns(3)}
                                aria-label="3 columns"
                            >
                                <Grid3X3 size={18} />
                            </button>
                        </div>

                        <button
                            className={styles.mobileFilterBtn}
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        >
                            <Filter size={18} />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className={styles.filterBadge}>{activeFiltersCount}</span>
                            )}
                        </button>
                    </div>
                </div>

                <div className={styles.layout}>
                    <aside className={styles.sidebar}>
                        <FilterContent />
                    </aside>

                    <AnimatePresence>
                        {mobileFiltersOpen && (
                            <>
                                <motion.div
                                    className={styles.mobileOverlay}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setMobileFiltersOpen(false)}
                                />
                                <motion.div
                                    className={styles.mobileDrawer}
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                >
                                    <div className={styles.mobileDrawerHeader}>
                                        <h3>Filters</h3>
                                        <button onClick={() => setMobileFiltersOpen(false)}>
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <FilterContent />
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    <div className={styles.content}>
                        {loading ? (
                            <ProductListSkeleton count={9} columns={gridColumns} />
                        ) : error ? (
                            <motion.div
                                className={styles.empty}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Package size={64} className="text-[var(--color-platinum)] mx-auto mb-4" />
                                <h3>Something went wrong</h3>
                                <p>{error}</p>
                                <button onClick={refreshData} className="btn btn-primary mt-4">
                                    Try Again
                                </button>
                            </motion.div>
                        ) : filteredProducts.length === 0 ? (
                            <motion.div
                                className={styles.empty}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Package size={64} className="text-[var(--color-platinum)] mx-auto mb-4" />
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or browse all categories</p>
                                <button onClick={clearFilters} className="btn btn-primary mt-4">
                                    Clear Filters
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                <motion.div
                                    className={styles.grid}
                                    style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <AnimatePresence mode="popLayout">
                                        {filteredProducts.map((product) => (
                                            <motion.div
                                                key={product._id || product.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <ProductCard product={product} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>

                                {resolvedCategoryName !== 'all' && filteredProducts.length < 4 && (
                                    <motion.div
                                        className={styles.comingSoonBanner}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <Sparkles size={20} className={styles.comingSoonIcon} />
                                        <div>
                                            <strong>More designs coming soon</strong>
                                            <p>We&apos;re expanding this collection. Chat with us for custom or upcoming pieces.</p>
                                        </div>
                                        <a
                                            href="https://wa.me/919582134493?text=Hi%20Marmex%2C%20I%27m%20looking%20for%20more%20options%20in%20this%20category."
                                            className={styles.comingSoonCta}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            WhatsApp Us
                                        </a>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
