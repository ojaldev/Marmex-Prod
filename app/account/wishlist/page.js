'use client'

import { useState, useEffect } from 'react'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import styles from './wishlist.module.css'

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const { addToCart } = useCart()

    useEffect(() => {
        fetchWishlist()
    }, [])

    const fetchWishlist = async () => {
        try {
            // Get wishlist product IDs
            const wishlistRes = await fetch('/api/user/wishlist')
            const wishlistData = await wishlistRes.json()

            if (wishlistData.wishlist?.length > 0) {
                // Get all products
                const productsRes = await fetch('/api/products')
                const allProducts = await productsRes.json()

                // Filter products that are in wishlist
                const wishlistProducts = allProducts.filter(p =>
                    wishlistData.wishlist.includes(p.id)
                )

                setProducts(wishlistProducts)
            }

            setWishlist(wishlistData.wishlist || [])
        } catch (error) {
            console.error('Failed to fetch wishlist:', error)
        } finally {
            setLoading(false)
        }
    }

    const removeFromWishlist = async (productId) => {
        try {
            await fetch(`/api/user/wishlist?productId=${productId}`, {
                method: 'DELETE'
            })

            setProducts(prev => prev.filter(p => p.id !== productId))
            setWishlist(prev => prev.filter(id => id !== productId))
        } catch (error) {
            console.error('Failed to remove from wishlist:', error)
        }
    }

    const handleAddToCart = (product) => {
        addToCart(product, 1)
    }

    if (loading) {
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
                            <div key={product.id} className={styles.card}>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeFromWishlist(product.id)}
                                >
                                    <Trash2 size={18} />
                                </button>

                                <Link href={`/products/${product.id}`} className={styles.imageWrapper}>
                                    {product.mainImage && (
                                        <img src={product.mainImage} alt={product.name} />
                                    )}
                                </Link>

                                <div className={styles.info}>
                                    <Link href={`/products/${product.id}`}>
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
