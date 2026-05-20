'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { useWishlist } from '@/contexts/WishlistContext'
import StarRating from './StarRating'
import QuickViewModal from './QuickViewModal'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, onAddToCart }) {
    const { toggleWishlist, isInWishlist } = useWishlist()
    const [imageLoaded, setImageLoaded] = useState(false)
    const [quickViewOpen, setQuickViewOpen] = useState(false)
    const [wishlistAnimating, setWishlistAnimating] = useState(false)

    const productId = product._id || product.id
    const isWishlisted = isInWishlist(productId)

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
        setWishlistAnimating(true)
        setTimeout(() => setWishlistAnimating(false), 600)
        toggleWishlist(productId)
    }

    const handleQuickView = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setQuickViewOpen(true)
    }

    return (
        <>
            <motion.div
                className={styles.productCard}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
            >
                {/* Image Container */}
                <Link href={`/products/${productId}`} className={styles.imageWrapper}>
                    <div className={styles.imageContainer}>
                        {product.mainImage && (
                            <>
                                <Image
                                    src={product.mainImage}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className={`${styles.productImage} ${imageLoaded ? styles.loaded : ''}`}
                                    onLoad={() => setImageLoaded(true)}
                                />
                                {product.additionalImages?.[0] && (
                                    <Image
                                        src={product.additionalImages[0]}
                                        alt={`${product.name} alternate view`}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className={styles.productImageHover}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Badges */}
                    <AnimatePresence>
                        {(product.highlight || product.discount > 0 || product.stock === 'Low Stock') && (
                            <div className={styles.badges}>
                                {product.highlight && (
                                    <motion.span
                                        className={`${styles.badge} ${styles.badgeHighlight}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        {product.highlight}
                                    </motion.span>
                                )}
                                {product.discount > 0 && (
                                    <motion.span
                                        className={`${styles.badge} ${styles.badgeDiscount}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        -{product.discount}%
                                    </motion.span>
                                )}
                                {product.stock === 'Low Stock' && (
                                    <motion.span
                                        className={`${styles.badge} ${styles.badgeStock}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Low Stock
                                    </motion.span>
                                )}
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Quick Actions */}
                    <div className={styles.quickActions}>
                        <motion.button
                            onClick={handleWishlistToggle}
                            className={`${styles.actionBtn} ${isWishlisted ? styles.wishlisted : ''} ${wishlistAnimating ? styles.wishlistAnimating : ''}`}
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </motion.button>
                        <motion.button
                            className={styles.actionBtn}
                            aria-label="Quick view"
                            type="button"
                            onClick={handleQuickView}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Eye size={18} />
                        </motion.button>
                    </div>

                    {/* Add to Cart */}
                    <motion.button
                        onClick={handleQuickAdd}
                        className={styles.addToCart}
                        type="button"
                        initial={false}
                    >
                        <ShoppingCart size={18} />
                        <span>Add to Cart</span>
                    </motion.button>
                </Link>

                {/* Product Info */}
                <div className={styles.productInfo}>
                    {product.category && (
                        <p className={styles.category}>{product.category}</p>
                    )}

                    <Link href={`/products/${productId}`}>
                        <h3 className={styles.productName}>{product.name}</h3>
                    </Link>

                    {product.rating && (
                        <StarRating
                            rating={product.rating}
                            reviewCount={product.reviewCount}
                            size={14}
                            className="mb-2"
                        />
                    )}

                    {product.shortDescription && (
                        <p className={styles.description}>{product.shortDescription}</p>
                    )}

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

                    {(product.customizationAvailable || product.freeShipping !== false) && (
                        <ul className={styles.features}>
                            {product.customizationAvailable && <li>✓ Customizable</li>}
                            {product.freeShipping !== false && <li>✓ Free Shipping</li>}
                        </ul>
                    )}
                </div>
            </motion.div>

            <QuickViewModal
                isOpen={quickViewOpen}
                onClose={() => setQuickViewOpen(false)}
                product={product}
                onAddToCart={onAddToCart}
            />
        </>
    )
}
