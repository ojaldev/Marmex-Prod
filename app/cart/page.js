'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { Minus, Plus, X, ArrowLeft, Lock, Truck, Shield, Package, ShoppingBag, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import QuantitySelector from '@/components/ui/QuantitySelector'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { getDeliveryEstimate, formatDeliveryDate } from '@/lib/delivery'
import styles from './cart.module.css'

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
    const [deliveryEstimate, setDeliveryEstimate] = useState(null)

    useEffect(() => {
        setDeliveryEstimate(getDeliveryEstimate())
    }, [])

    const freeShippingThreshold = 2999
    const currentTotal = getCartTotal()
    const amountToFreeShipping = Math.max(0, freeShippingThreshold - currentTotal)
    const shippingProgress = Math.min((currentTotal / freeShippingThreshold) * 100, 100)
    const shipping = currentTotal >= freeShippingThreshold ? 0 : 199
    const tax = currentTotal * 0.18
    const grandTotal = currentTotal + shipping + tax

    return (
        <main className={styles.cartPage}>
            <div className="container">
                {/* Breadcrumb */}
                <motion.nav
                    className={styles.breadcrumb}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span>Shopping Cart</span>
                </motion.nav>

                <motion.h1
                    className={styles.pageTitle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Shopping Cart
                </motion.h1>

                {cart.length === 0 ? (
                    <motion.div
                        className={styles.emptyCart}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className={styles.emptyIcon}>
                            <ShoppingBag size={64} />
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Add some amazing marble products to get started!</p>
                        <Link href="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </motion.div>
                ) : (
                    <div className={styles.cartLayout}>
                        {/* Cart Items */}
                        <div className={styles.itemsSection}>
                            {/* Free Shipping Progress */}
                            <motion.div
                                className={`${styles.shippingBanner} ${currentTotal >= freeShippingThreshold ? styles.achieved : ''}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {currentTotal < freeShippingThreshold ? (
                                    <>
                                        <p>
                                            Add <strong>₹{amountToFreeShipping.toLocaleString()}</strong> more to unlock FREE shipping!
                                        </p>
                                        <div className={styles.progressBar}>
                                            <motion.div
                                                className={styles.progress}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${shippingProgress}%` }}
                                                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <motion.p
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                    >
                                        🎉 You&apos;ve unlocked <strong>Free Shipping</strong>!
                                    </motion.p>
                                )}
                            </motion.div>

                            <div className={styles.itemsHeader}>
                                <h2>{cart.length} Item{cart.length !== 1 ? 's' : ''} in Cart</h2>
                                {cart.length > 0 && (
                                    <motion.button
                                        onClick={clearCart}
                                        className={styles.clearBtn}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Clear All
                                    </motion.button>
                                )}
                            </div>

                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                <AnimatePresence mode="popLayout">
                                    {cart.map(item => {
                                        const itemPrice = item.discount > 0
                                            ? item.price * (100 - item.discount) / 100
                                            : item.price

                                        return (
                                            <motion.div
                                                key={item.id}
                                                className={styles.cartItem}
                                                variants={fadeInUp}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Link href={`/products/${item.id}`} className={styles.itemImage}>
                                                    {item.mainImage ? (
                                                        <Image
                                                            src={item.mainImage}
                                                            alt={item.name}
                                                            fill
                                                            className={styles.image}
                                                            sizes="120px"
                                                        />
                                                    ) : (
                                                        <div className={styles.imagePlaceholder}>No Image</div>
                                                    )}
                                                </Link>

                                                <div className={styles.itemInfo}>
                                                    <Link href={`/products/${item.id}`} className={styles.itemName}>
                                                        {item.name}
                                                    </Link>

                                                    {item.category && (
                                                        <p className={styles.itemCategory}>{item.category}</p>
                                                    )}

                                                    {item.discount > 0 && (
                                                        <p className={styles.savings}>
                                                            You save ₹{((item.price - itemPrice) * item.quantity).toLocaleString()}
                                                        </p>
                                                    )}

                                                    <div className={styles.itemActions}>
                                                        <QuantitySelector
                                                            value={item.quantity}
                                                            onChange={(qty) => updateQuantity(item.id, qty)}
                                                            size="small"
                                                        />

                                                        <div className={styles.priceSection}>
                                                            {item.discount > 0 && (
                                                                <span className={styles.originalPrice}>
                                                                    ₹{(item.price * item.quantity).toLocaleString()}
                                                                </span>
                                                            )}
                                                            <span className={styles.currentPrice}>
                                                                ₹{(itemPrice * item.quantity).toLocaleString()}
                                                            </span>
                                                        </div>

                                                        <motion.button
                                                            className={styles.removeBtn}
                                                            onClick={() => removeFromCart(item.id)}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            aria-label="Remove item"
                                                        >
                                                            <X size={18} />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* Order Summary */}
                        <motion.div
                            className={styles.summarySection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className={styles.summaryCard}>
                                <h3>Order Summary</h3>

                                <div className={styles.summaryRow}>
                                    <span>Subtotal</span>
                                    <span>₹{currentTotal.toLocaleString()}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? styles.free : ''}>
                                        {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Tax (18% GST)</span>
                                    <span>₹{tax.toLocaleString()}</span>
                                </div>

                                <div className={styles.summaryDivider} />

                                <div className={`${styles.summaryRow} ${styles.total}`}>
                                    <span>Total</span>
                                    <span>₹{grandTotal.toLocaleString()}</span>
                                </div>

                                {deliveryEstimate && formatDeliveryDate(deliveryEstimate.estimatedDays) && (
                                    <p className={styles.deliveryEstimate}>
                                        <MapPin size={14} />
                                        Delivers to <strong>{deliveryEstimate.pincode}</strong> by {formatDeliveryDate(deliveryEstimate.estimatedDays)}
                                    </p>
                                )}

                                <Link href="/checkout" className="btn btn-primary w-full mt-6">
                                    <Lock size={18} />
                                    Proceed to Checkout
                                </Link>

                                <Link href="/products" className={styles.continueShopping}>
                                    <ArrowLeft size={16} />
                                    Continue Shopping
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <div className={styles.trustBadges}>
                                <div className={styles.trustBadge}>
                                    <Truck size={18} className="text-[var(--color-gold-24k)]" />
                                    <span>Free shipping on orders above ₹2,999</span>
                                </div>
                                <div className={styles.trustBadge}>
                                    <Shield size={18} className="text-[var(--color-gold-24k)]" />
                                    <span>Secure SSL encrypted checkout</span>
                                </div>
                                <div className={styles.trustBadge}>
                                    <Package size={18} className="text-[var(--color-gold-24k)]" />
                                    <span>Carefully packed & insured delivery</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </main>
    )
}
