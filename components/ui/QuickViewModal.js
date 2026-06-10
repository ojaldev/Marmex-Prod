'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, X, Truck, Shield, RotateCcw, Check } from 'lucide-react'
import { useWishlist } from '@/contexts/WishlistContext'
import Modal from './Modal'
import StarRating from './StarRating'
import QuantitySelector from './QuantitySelector'

export default function QuickViewModal({ isOpen, onClose, product, onAddToCart }) {
    const { toggleWishlist, isInWishlist } = useWishlist()
    const [quantity, setQuantity] = useState(1)
    const [added, setAdded] = useState(false)
    const [wishlistAnimating, setWishlistAnimating] = useState(false)

    const productId = product?._id || product?.id
    const isWishlisted = isInWishlist(productId)

    if (!product) return null

    const discountedPrice = product.discount > 0
        ? (product.price * (100 - product.discount) / 100).toFixed(0)
        : null

    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart({ ...product, quantity })
            setAdded(true)
            setTimeout(() => {
                setAdded(false)
                onClose()
            }, 1500)
        }
    }

    const handleWishlistToggle = () => {
        setWishlistAnimating(true)
        setTimeout(() => setWishlistAnimating(false), 600)
        const price = discountedPrice ? Number(discountedPrice) : product.price
        toggleWishlist(productId, price)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="large" showClose={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[var(--color-pearl)]">
                    {product.mainImage ? (
                        <Image
                            src={product.mainImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                            No Image
                        </div>
                    )}
                    {product.discount > 0 && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-[var(--color-ruby)] text-white text-xs font-bold rounded-full">
                            -{product.discount}%
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    {product.category && (
                        <span className="text-sm uppercase tracking-wider text-[var(--color-text-gray)] font-semibold mb-2">
                            {product.category}
                        </span>
                    )}

                    <h2 className="text-3xl font-[family-name:var(--font-display)] font-semibold text-[var(--color-obsidian)] mb-3">
                        {product.name}
                    </h2>

                    {product.rating && (
                        <StarRating
                            rating={product.rating}
                            reviewCount={product.reviewCount}
                            showValue
                            className="mb-4"
                        />
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        {discountedPrice ? (
                            <>
                                <span className="text-3xl font-[family-name:var(--font-display)] font-bold text-[var(--color-obsidian)]">
                                    ₹{parseInt(discountedPrice).toLocaleString()}
                                </span>
                                <span className="text-lg text-[var(--color-text-gray)] line-through">
                                    ₹{product.price?.toLocaleString()}
                                </span>
                            </>
                        ) : (
                            <span className="text-3xl font-[family-name:var(--font-display)] font-bold text-[var(--color-obsidian)]">
                                ₹{product.price?.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <p className="text-[var(--color-text-gray)] leading-relaxed mb-6">
                        {product.shortDescription || product.description?.substring(0, 200)}...
                    </p>

                    {/* Quantity */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-[var(--color-obsidian)] mb-2">
                            Quantity
                        </label>
                        <QuantitySelector value={quantity} onChange={setQuantity} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-6">
                        <motion.button
                            onClick={handleAddToCart}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all ${
                                added
                                    ? 'bg-[var(--color-emerald)] text-white'
                                    : 'bg-[var(--color-obsidian)] text-[var(--color-gold-24k)] hover:shadow-[var(--shadow-gold)]'
                            }`}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {added ? (
                                <>
                                    <Check size={18} />
                                    Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={18} />
                                    Add to Cart
                                </>
                            )}
                        </motion.button>
                        <motion.button
                            onClick={handleWishlistToggle}
                            className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-colors ${
                                isWishlisted
                                    ? 'bg-[var(--color-ruby)] border-[var(--color-ruby)] text-white'
                                    : 'border-[var(--color-platinum)] text-[var(--color-obsidian)] hover:border-[var(--color-ruby)] hover:text-[var(--color-ruby)]'
                            } ${wishlistAnimating ? 'animate-pulse' : ''}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </motion.button>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="flex flex-col items-center text-center p-3 bg-[var(--color-pearl)] rounded-lg">
                            <Truck size={18} className="text-[var(--color-gold-24k)] mb-1" />
                            <span className="text-[10px] font-semibold text-[var(--color-obsidian)] uppercase tracking-wide">Free Shipping</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-3 bg-[var(--color-pearl)] rounded-lg">
                            <Shield size={18} className="text-[var(--color-gold-24k)] mb-1" />
                            <span className="text-[10px] font-semibold text-[var(--color-obsidian)] uppercase tracking-wide">Secure</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-3 bg-[var(--color-pearl)] rounded-lg">
                            <RotateCcw size={18} className="text-[var(--color-gold-24k)] mb-1" />
                            <span className="text-[10px] font-semibold text-[var(--color-obsidian)] uppercase tracking-wide">30-Day Return</span>
                        </div>
                    </div>

                    <Link
                        href={`/products/${productId}`}
                        className="text-center text-sm font-semibold text-[var(--color-gold-24k)] hover:text-[var(--color-gold-dark)] transition-colors"
                        onClick={onClose}
                    >
                        View Full Details →
                    </Link>
                </div>
            </div>
        </Modal>
    )
}
