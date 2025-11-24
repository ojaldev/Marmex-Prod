'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react'
import styles from './products.module.css'

export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            const res = await fetch('/api/products')
            const data = await res.json()
            // Handle new MongoDB API format {products: [], pagination: {}}
            const productList = data.products || data
            setProducts(productList)
        } catch (error) {
            console.error('Failed to load products:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' })
            loadProducts()
        } catch (error) {
            console.error('Failed to delete product:', error)
        }
    }

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1>Products</h1>
                    <p>Manage your product catalog</p>
                </div>
                <Link href="/admin/products/new" className="btn btn-primary">
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading products...</div>
            ) : products.length === 0 ? (
                <div className={styles.empty}>
                    <Package size={64} color="var(--color-text-light)" />
                    <h3>No products yet</h3>
                    <p>Start by adding your first product</p>
                    <Link href="/admin/products/new" className="btn btn-primary">Add Product</Link>
                </div>
            ) : (
                <div className={styles.productsTable}>
                    <div className={styles.tableHeader}>
                        <div>Product Name</div>
                        <div>Category</div>
                        <div>Price</div>
                        <div>Stock</div>
                        <div>Actions</div>
                    </div>
                    {products.map(product => (
                        <div key={product._id || product.id} className={styles.tableRow}>
                            <div className={styles.productName}>
                                {product.mainImage && (
                                    <div className={styles.productThumb} style={{ backgroundImage: `url(${product.mainImage})` }} />
                                )}
                                <span>{product.name}</span>
                            </div>
                            <div>{product.category || 'Uncategorized'}</div>
                            <div>₹{product.price?.toLocaleString() || 'N/A'}</div>
                            <div>
                                <span className={`${styles.stockBadge} ${styles[product.stock?.toLowerCase().replace(/\s/g, '')]}`}>
                                    {product.stock || 'Unknown'}
                                </span>
                            </div>
                            <div className={styles.actions}>
                                <button className={styles.actionBtn} title="View">
                                    <Eye size={16} />
                                </button>
                                <Link href={`/admin/products/${product._id || product.id}`} className={styles.actionBtn} title="Edit">
                                    <Edit size={16} />
                                </Link>
                                <button onClick={() => deleteProduct(product._id || product.id)} className={styles.actionBtn} title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
