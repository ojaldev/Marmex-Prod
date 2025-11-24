'use client'

import { useCart } from '@/contexts/CartContext'
import { Minus, Plus, X, ArrowLeft, Lock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './cart.module.css'

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()

    const freeShippingThreshold = 2999
    const currentTotal = getCartTotal()
    const amountToFreeShipping = freeShippingThreshold - currentTotal
    const shippingProgress = Math.min((currentTotal / freeShippingThreshold) * 100, 100)
    const shipping = currentTotal >= freeShippingThreshold ? 0 : 199
    const tax = currentTotal * 0.18 // 18% GST
    const grandTotal = currentTotal + shipping + tax

    return (
        <main className={styles.cartPage}>
            <div className="container">
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span>Shopping Cart</span>
                </nav>

                <h1 className={styles.pageTitle}>Shopping Cart</h1>

                {cart.length === 0 ? (
                    <div className={styles.emptyCart}>
                        <div className={styles.emptyIcon}>🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Add some amazing marble products to get started!</p>
                        <Link href="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className={styles.cartLayout}>
                        {/* Cart Items */}
                        <div className={styles.itemsSection}>
                            {/* Free Shipping Progress */}
                            {currentTotal < freeShippingThreshold && (
                                <div className={styles.shippingBanner}>
                                    <p>
                                        Add <strong>₹{amountToFreeShipping.toLocaleString()}</strong> more to unlock FREE shipping!
                                    </p>
                                    <div className={styles.progressBar}>
                                        <div className={styles.progress} style={{ width: `${shippingProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {currentTotal >= freeShippingThreshold && (
                                <div className={`${styles.shippingBanner} ${styles.achieved}`}>
                                    <p>🎉 You've unlocked <strong>Free Shipping</strong>!</p>
                                </div>
                            )}

                            <div className={styles.itemsHeader}>
                                <h2>{cart.length} Item{cart.length !== 1 ? 's' : ''} in Cart</h2>
                                {cart.length > 0 && (
                                    <button onClick={clearCart} className={styles.clearBtn}>
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {cart.map(item => {
                                const itemPrice = item.discount > 0
                                    ? item.price * (100 - item.discount) / 100
                                    : item.price

                                return (
                                    <div key={item.id} className={styles.cartItem}>
                                        <Link href={`/products/${item.id}`} className={styles.itemImage}>
                                            {item.mainImage ? (
                                                <Image
                                                    src={item.mainImage}
                                                    alt={item.name}
                                                    fill
                                                    className={styles.image}
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

                                            {item.shortDescription && (
                                                <p className={styles.itemDescription}>{item.shortDescription}</p>
                                            )}

                                            {item.discount > 0 && (
                                                <div className={styles.savings}>
                                                    You save ₹{((item.price - itemPrice) * item.quantity).toLocaleString()}
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.itemActions}>
                                            <div className={styles.priceSection}>
                                                {item.discount > 0 && (
                                                    <span className={styles.originalPrice}>₹{item.price.toLocaleString()}</span>
                                                )}
                                                <span className={styles.currentPrice}>₹{itemPrice.toLocaleString()}</span>
                                            </div>

                                            <div className={styles.quantityControl}>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className={styles.quantityBtn}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={18} />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                    className={styles.quantityInput}
                                                    min="1"
                                                />
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className={styles.quantityBtn}
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>

                                            <div className={styles.itemTotal}>
                                                ₹{(itemPrice * item.quantity).toLocaleString()}
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className={styles.removeBtn}
                                                aria-label="Remove item"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className={styles.summarySection}>
                            <div className={styles.summaryCard}>
                                <h3>Order Summary</h3>

                                <div className={styles.summaryRow}>
                                    <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                    <span>₹{currentTotal.toLocaleString()}</span>
                                </div>

                                <div className={styles.summaryRow}>
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? styles.free : ''}>
                                        {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}
                                    </span>
                                </div>

                                <div className={styles.summaryRow}>
                                    <span>Tax (GST 18%)</span>
                                    <span>₹{tax.toLocaleString()}</span>
                                </div>

                                <div className={styles.summaryDivider} />

                                <div className={`${styles.summaryRow} ${styles.total}`}>
                                    <span>Total</span>
                                    <span>₹{grandTotal.toLocaleString()}</span>
                                </div>

                                <Link href="/checkout" className="btn btn-primary" style={{ width: '100%' }}>
                                    <Lock size={18} />
                                    Proceed to Checkout
                                </Link>

                                <Link href="/products" className={styles.continueShopping}>
                                    <ArrowLeft size={18} />
                                    Continue Shopping
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <div className={styles.trustBadges}>
                                <div className={styles.trustBadge}>
                                    <Lock size={20} />
                                    <span>Secure Checkout</span>
                                </div>
                                <div className={styles.trustBadge}>
                                    <span>🎁</span>
                                    <span>Free Gift Wrapping</span>
                                </div>
                                <div className={styles.trustBadge}>
                                    <span>🚚</span>
                                    <span>Fast Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
