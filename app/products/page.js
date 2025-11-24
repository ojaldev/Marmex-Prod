'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ui/ProductCard'
import { ProductListSkeleton } from '@/components/ui/SkeletonLoader'
import { Filter, Package } from 'lucide-react'
import styles from './products.module.css'

export default function ProductsPage() {
    const searchParams = useSearchParams()
    const category = searchParams.get('category')

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState(category || 'all')
    const [gridColumns, setGridColumns] = useState(3)

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

            // Handle new MongoDB API format {products: [], pagination: {}}
            const productList = productsData.products || productsData

            setProducts(productList)
            setCategories(categoriesData)
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory)

    return (
        <main className={styles.productsPage}>
            <div className={styles.hero}>
                <div className="container">
                    <h1>Our Products</h1>
                    <p>Discover exquisite handcrafted marble and stone art</p>
                </div>
            </div>

            <div className="container">
                <div className={styles.toolbar}>
                    <div className={styles.toolbarLeft}>
                        <h2 className={styles.resultsCount}>
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                        </h2>
                    </div>

                    <div className={styles.toolbarRight}>
                        {/* Sort Dropdown */}
                        <select
                            className={styles.sortSelect}
                            onChange={(e) => {
                                const sorted = [...filteredProducts].sort((a, b) => {
                                    switch (e.target.value) {
                                        case 'price-low': return (a.price || 0) - (b.price || 0)
                                        case 'price-high': return (b.price || 0) - (a.price || 0)
                                        case 'name': return (a.name || '').localeCompare(b.name || '')
                                        default: return 0
                                    }
                                })
                                setProducts(sorted)
                            }}
                        >
                            <option value="featured">Featured</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name: A-Z</option>
                        </select>

                        {/* Grid View Toggle */}
                        <div className={styles.viewToggle}>
                            <button
                                className={`${styles.viewBtn} ${gridColumns === 2 ? styles.active : ''}`}
                                onClick={() => setGridColumns(2)}
                                aria-label="2 columns"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect x="2" y="2" width="7" height="16" rx="1" fill="currentColor" />
                                    <rect x="11" y="2" width="7" height="16" rx="1" fill="currentColor" />
                                </svg>
                            </button>
                            <button
                                className={`${styles.viewBtn} ${gridColumns === 3 ? styles.active : ''}`}
                                onClick={() => setGridColumns(3)}
                                aria-label="3 columns"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect x="2" y="2" width="5" height="16" rx="1" fill="currentColor" />
                                    <rect x="8" y="2" width="5" height="16" rx="1" fill="currentColor" />
                                    <rect x="14" y="2" width="4" height="16" rx="1" fill="currentColor" />
                                </svg>
                            </button>
                            <button
                                className={`${styles.viewBtn} ${gridColumns === 4 ? styles.active : ''}`}
                                onClick={() => setGridColumns(4)}
                                aria-label="4 columns"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect x="2" y="2" width="4" height="16" rx="1" fill="currentColor" />
                                    <rect x="7" y="2" width="4" height="16" rx="1" fill="currentColor" />
                                    <rect x="12" y="2" width="4" height="16" rx="1" fill="currentColor" />
                                    <rect x="17" y="2" width="1" height="16" rx="0.5" fill="currentColor" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.layout}>
                    <aside className={styles.sidebar}>
                        <div className={styles.filterSection}>
                            <h3><Filter size={18} /> Filter by Category</h3>
                            <div className={styles.filterList}>
                                <button
                                    className={selectedCategory === 'all' ? styles.active : ''}
                                    onClick={() => setSelectedCategory('all')}
                                >
                                    All Products ({products.length})
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={selectedCategory === cat.name ? styles.active : ''}
                                        onClick={() => setSelectedCategory(cat.name)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <div className={styles.content}>
                        {loading ? (
                            <ProductListSkeleton count={6} />
                        ) : filteredProducts.length === 0 ? (
                            <div className={styles.empty}>
                                <Package size={64} color="var(--color-text-light)" />
                                <h3>No products found</h3>
                                <p>Check back soon for new items or browse all categories</p>
                            </div>
                        ) : (
                            <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}>
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
