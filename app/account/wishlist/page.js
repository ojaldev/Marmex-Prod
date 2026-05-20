'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import ProductCard from '@/components/ui/ProductCard'
import { ProductListSkeleton } from '@/components/ui/SkeletonLoader'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import styles from './wishlist.module.css'

export default function WishlistPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const { addToCart } = useCart()
    const { wishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist()

    useEffect(() => {
        if (!wishlistLoading) {
            fetchProducts()
        }
    }, [wishlist, wishlistLoading])

    const fetchProducts = async () => {
        if (wishlist.length === 0) {
            setProducts([])
            setLoading(false)
            return
        }

        try {
            const productsRes = await fetch('/api/products')
            const productsData = await productsRes.json()
            const allProducts = productsData.products || productsData || []

            // Filter products that are in wishlist (handle both id and _id)
            const wishlistProducts = allProducts.filter(p =>
                wishlist.includes(p._id?.toString()) ||
                wishlist.includes(p.id) ||
                wishlist.includes(p._id)
            )

            setProducts(wishlistProducts)
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = (product) => {
        addToCart(product, 1)
    }

    if (loading || wishlistLoading) {
        return (
            <div className={styles.wishlistPage}>
                <div className="container">
                    <div className="section-title">My Wishlist</div>
                    <ProductListSkeleton count={6} columns={3} />
                </div>
            </div>
        )
    }

    return (
        <div className={styles.wishlistPage}>
            <div className="container">
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="section-title" style={{ marginBottom: 'var(--space-sm)' }}>
                        My Wishlist
                    </h1>
                    <p className={styles.count}>
                        {products.length} {products.length === 1 ? 'item' : 'items'} saved
                    </p>
                </motion.div>

                {products.length === 0 ? (
                    <motion.div
                        className={styles.empty}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className={styles.emptyIcon}>
                            <Heart size={56} />
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save your favorite pieces and find them here anytime.</p>
                        <Link href="/products" className="btn btn-primary">
                            <ShoppingBag size={18} />
                            Browse Products
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        className={styles.grid}
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {products.map(product => (
                            <motion.div
                                key={product._id || product.id}
                                variants={fadeInUp}
                                layout
                            >
                                <ProductCard
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
