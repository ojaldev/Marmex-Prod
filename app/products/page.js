'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/ui/ProductCard'
import { ProductListSkeleton } from '@/components/ui/SkeletonLoader'
import { Filter, Package, X, SlidersHorizontal, Grid3X3, LayoutGrid } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import styles from './products.module.css'

export default function ProductsPage() {
    const searchParams = useSearchParams()
    const categoryParam = searchParams.get('category')
    const searchQuery = searchParams.get('search')

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all')
    const [sortBy, setSortBy] = useState('featured')
    const [gridColumns, setGridColumns] = useState(3)
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [priceRange, setPriceRange] = useState([0, 100000])

    // Resolve category param to actual category name (handles both slug and name)
    const resolvedCategoryName = useMemo(() => {
        if (!selectedCategory || selectedCategory === 'all') return 'all'
        const decoded = decodeURIComponent(selectedCategory)
        // Try exact match first
        const exactMatch = categories.find(c => c.name === decoded)
        if (exactMatch) return exactMatch.name
        // Try slug match
        const slugMatch = categories.find(c => c.slug === decoded)
        if (slugMatch) return slugMatch.name
        // Try case-insensitive match
        const caseMatch = categories.find(c =>
            c.name.toLowerCase() === decoded.toLowerCase()
        )
        if (caseMatch) return caseMatch.name
        // Fallback: return decoded (for direct name matches from products)
        return decoded
    }, [selectedCategory, categories])

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam)
        }
    }, [categoryParam])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/categories')
            ])

            const productsData = await productsRes.json()
            const categoriesData = await categoriesRes.json()

            const productList = productsData.products || productsData
            setProducts(productList)
            setCategories(categoriesData)
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter and sort
    const filteredProducts = useMemo(() => {
        let result = [...products]

        // Category filter
        if (resolvedCategoryName !== 'all') {
            result = result.filter(p =>
                p.category === resolvedCategoryName ||
                p.category?.toLowerCase() === resolvedCategoryName.toLowerCase()
            )
        }

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            result = result.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.tags?.some(t => t.toLowerCase().includes(q))
            )
        }

        // Price filter
        result = result.filter(p => {
            const price = p.discount > 0 ? p.price * (100 - p.discount) / 100 : p.price
            return price >= priceRange[0] && price <= priceRange[1]
        })

        // Sort
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
            default:
                // Featured - no specific sort
                break
        }

        return result
    }, [products, selectedCategory, sortBy, searchQuery, priceRange])

    const activeFiltersCount = (resolvedCategoryName !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)

    const clearFilters = () => {
        setSelectedCategory('all')
        setPriceRange([0, 100000])
        // Also clear the URL param by replacing history
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.delete('category')
            window.history.replaceState({}, '', url)
        }
    }

    // Filter sidebar content
    const FilterContent = () => (
        <>
            <div className={styles.filterSection}>
                <h3><Filter size={18} /> Categories</h3>
                <div className={styles.filterList}>
                    <button
                        className={selectedCategory === 'all' ? styles.active : ''}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All Products
                        <span className={styles.filterCount}>{products.length}</span>
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id || cat._id}
                            className={resolvedCategoryName === cat.name ? styles.active : ''}
                            onClick={() => setSelectedCategory(cat.name)}
                        >
                            {cat.name}
                            <span className={styles.filterCount}>
                                {products.filter(p => p.category === cat.name).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Filters */}
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
                                <button onClick={() => setSelectedCategory('all')}>
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {searchQuery && (
                            <span className={styles.chip}>
                                Search: "{searchQuery}"
                                <button onClick={() => { /* would need router */ }}>
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
            {/* Hero */}
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
                        {searchQuery ? `Search: "${searchQuery}"` : 'Our Products'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        {searchQuery
                            ? `Found ${filteredProducts.length} result${filteredProducts.length !== 1 ? 's' : ''}`
                            : 'Discover exquisite handcrafted marble and stone art'
                        }
                    </motion.p>
                </div>
            </motion.div>

            <div className="container">
                {/* Toolbar */}
                <div className={styles.toolbar}>
                    <div className={styles.toolbarLeft}>
                        <h2 className={styles.resultsCount}>
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                        </h2>
                    </div>

                    <div className={styles.toolbarRight}>
                        {/* Sort */}
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

                        {/* Grid Toggle */}
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

                        {/* Mobile Filter Toggle */}
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
                    {/* Desktop Sidebar */}
                    <aside className={styles.sidebar}>
                        <FilterContent />
                    </aside>

                    {/* Mobile Filter Drawer */}
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

                    {/* Product Grid */}
                    <div className={styles.content}>
                        {loading ? (
                            <ProductListSkeleton count={9} columns={gridColumns} />
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
                                            variants={fadeInUp}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
