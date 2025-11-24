'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted = false }) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [currentImage, setCurrentImage] = useState(0)

    const discountedPrice = product.discount > 0
        ? (product.price * (100 - product.discount) / 100).toFixed(0)
        : null

    const handleQuickAdd = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (onAddToCart) {
            onAddToCart(product)
        }
    }

    const handleWishlistToggle = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (onToggleWishlist) {
            onToggleWishlist(product._id || product.id)
        }
    }

    return (
        <div className={styles.productCard}>
            {/* Image Container */}
            <Link href={`/products/${product._id || product.id}`} className={styles.imageWrapper}>
                {/* Main Image */}
                {product.mainImage && (
                    <div className={styles.imageContainer}>
                        <Image
                            src={product.mainImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className={`${styles.productImage} ${imageLoaded ? styles.loaded : ''}`}
                            onLoad={() => setImageLoaded(true)}
                        />

                        {/* Hover Image (if available) */}
                        {product.gallery && product.gallery[0] && (
                            <Image
                                src={product.gallery[0]}
                                alt={`${product.name} alternate view`}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className={styles.productImageHover}
                            />
                        )}
                    </div>
                )}

                {/* Badges */}
                {(product.highlight || product.discount > 0 || product.stock === 'Low Stock') && (
                    <div className={styles.badges}>
                        {product.highlight && (
                            <span className={`${styles.badge} ${styles.badgeHighlight}`}>
                                {product.highlight}
                            </span>
                        )}
                        {product.discount > 0 && (
                            <span className={`${styles.badge} ${styles.badgeDiscount}`}>
                                -{product.discount}%
                            </span>
                        )}
                        {product.stock === 'Low Stock' && (
                            <span className={`${styles.badge} ${styles.badgeStock}`}>
                                Low Stock
                            </span>
                        )}
                    </div>
                )}

                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <button
                        onClick={handleWishlistToggle}
                        className={`${styles.actionBtn} ${isWishlisted ? styles.wishlisted : ''}`}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        type="button"
                    >
                        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        className={styles.actionBtn}
                        aria-label="Quick view"
                        type="button"
                    >
                        <Eye size={18} />
                    </button>
                </div>

                {/* Add to Cart (Slide up on hover) */}
                <button
                    onClick={handleQuickAdd}
                    className={styles.addToCart}
                    type="button"
                >
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                </button>
            </Link>

            {/* Product Info */}
            <div className={styles.productInfo}>
                {product.category && (
                    <p className={styles.category}>{product.category}</p>
                )}

                <Link href={`/products/${product._id || product.id}`}>
                    <h3 className={styles.productName}>{product.name}</h3>
                </Link>

                {/* Rating (if available) */}
                {product.rating && (
                    <div className={styles.rating}>
                        <div className={styles.stars}>
                            {'★'.repeat(Math.floor(product.rating))}
                            {'☆'.repeat(5 - Math.floor(product.rating))}
                        </div>
                        {product.reviewCount && (
                            <span className={styles.reviewCount}>({product.reviewCount})</span>
                        )}
                    </div>
                )}

                {/* Short Description */}
                {product.shortDescription && (
                    <p className={styles.description}>{product.shortDescription}</p>
                )}

                {/* Price */}
                <div className={styles.priceContainer}>
                    {discountedPrice ? (
                        <>
                            <span className={styles.currentPrice}>₹{parseInt(discountedPrice).toLocaleString()}</span>
                            <span className={styles.originalPrice}>₹{product.price?.toLocaleString()}</span>
                        </>
                    ) : (
                        <span className={styles.currentPrice}>₹{product.price?.toLocaleString()}</span>
                    )}
                </div>

                {/* Features */}
                {(product.customizable || product.freeShipping) && (
                    <ul className={styles.features}>
                        {product.customizable && <li>✓ Customizable</li>}
                        {product.freeShipping !== false && <li>✓ Free Shipping</li>}
                    </ul>
                )}
            </div>
        </div>
    )
}
