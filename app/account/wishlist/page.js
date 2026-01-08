'use client'

import { useState, useEffect } from 'react'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
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
            // Get all products
            const productsRes = await fetch('/api/products')
            const allProducts = await productsRes.json()

            // Filter products that are in wishlist (handle both id and _id)
            const wishlistProducts = allProducts.filter(p =>
                wishlist.includes(p.id) || wishlist.includes(p._id)
            )

            setProducts(wishlistProducts)
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async (productId) => {
        await removeFromWishlist(productId)
        setProducts(prev => prev.filter(p => p.id !== productId && p._id !== productId))
    }

    const handleAddToCart = (product) => {
        addToCart(product, 1)
    }

    if (loading || wishlistLoading) {
        return <div className={styles.loading}>Loading wishlist...</div>
    }

    return (
        <div className={styles.wishlistPage}>
            <div className="container">
                <h1>My Wishlist</h1>
                <p className={styles.count}>{products.length} {products.length === 1 ? 'item' : 'items'}</p>

                {products.length === 0 ? (
                    <div className={styles.empty}>
                        <Heart size={64} />
                        <h2>Your wishlist is empty</h2>
                        <p>Start adding items you love!</p>
                        <Link href="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {products.map(product => (
                            <div key={product._id || product.id} className={styles.card}>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => handleRemove(product._id || product.id)}
                                >
                                    <Trash2 size={18} />
                                </button>

                                <Link href={`/products/${product._id || product.id}`} className={styles.imageWrapper}>
                                    {(product.mainImage || product.images?.[0]) && (
                                        <img src={product.mainImage || product.images?.[0]} alt={product.name} />
                                    )}
                                </Link>

                                <div className={styles.info}>
                                    <Link href={`/products/${product._id || product.id}`}>
                                        <h3>{product.name}</h3>
                                    </Link>

                                    <div className={styles.price}>
                                        {product.discount > 0 ? (
                                            <>
                                                <span className={styles.currentPrice}>
                                                    ₹{Math.round(product.price * (1 - product.discount / 100)).toLocaleString()}
                                                </span>
                                                <span className={styles.originalPrice}>
                                                    ₹{product.price?.toLocaleString()}
                                                </span>
                                            </>
                                        ) : (
                                            <span className={styles.currentPrice}>
                                                ₹{product.price?.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className={styles.addToCartBtn}
                                    >
                                        <ShoppingCart size={18} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

