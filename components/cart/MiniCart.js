'use client'

import { useCart } from '@/contexts/CartContext'
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './MiniCart.module.css'

export default function MiniCart() {
    const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart()

    const freeShippingThreshold = 2999
    const currentTotal = getCartTotal()
    const amountToFreeShipping = freeShippingThreshold - currentTotal
    const shippingProgress = Math.min((currentTotal / freeShippingThreshold) * 100, 100)

    if (!isCartOpen) return null

    return (
        <>
            {/* Overlay */}
            <div className={styles.overlay} onClick={() => setIsCartOpen(false)} />

            {/* Mini Cart Sidebar */}
            <div className={styles.miniCart}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        <ShoppingBag size={24} />
                        <h2>Shopping Cart ({getCartCount()})</h2>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setIsCartOpen(false)}
                        aria-label="Close cart"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Free Shipping Progress */}
                {currentTotal < freeShippingThreshold && (
                    <div className={styles.shippingBanner}>
                        <p className={styles.shippingText}>
                            Add <strong>₹{amountToFreeShipping.toLocaleString()}</strong> more for free shipping!
                        </p>
                        <div className={styles.progressBar}>
                            <div className={styles.progress} style={{ width: `${shippingProgress}%` }} />
                        </div>
                    </div>
                )}

                {currentTotal >= freeShippingThreshold && (
                    <div className={`${styles.shippingBanner} ${styles.achieved}`}>
                        <p className={styles.shippingText}>
                            🎉 You've unlocked <strong>Free Shipping</strong>!
                        </p>
                    </div>
                )}

                {/* Cart Items */}
                <div className={styles.itemsContainer}>
                    {cart.length === 0 ? (
                        <div className={styles.empty}>
                            <ShoppingBag size={64} className={styles.emptyIcon} />
                            <p>Your cart is empty</p>
                            <Link href="/products" className="btn btn-primary" onClick={() => setIsCartOpen(false)}>
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        cart.map(item => {
                            const itemPrice = item.discount > 0
                                ? item.price * (100 - item.discount) / 100
                                : item.price

                            return (
                                <div key={item.id} className={styles.cartItem}>
                                    <div className={styles.itemImage}>
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
                                    </div>

                                    <div className={styles.itemDetails}>
                                        <Link
                                            href={`/products/${item.id}`}
                                            className={styles.itemName}
                                            onClick={() => setIsCartOpen(false)}
                                        >
                                            {item.name}
                                        </Link>

                                        {item.category && (
                                            <p className={styles.itemCategory}>{item.category}</p>
                                        )}

                                        <div className={styles.itemFooter}>
                                            <div className={styles.quantityControl}>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className={styles.quantityBtn}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className={styles.quantity}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className={styles.quantityBtn}
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <div className={styles.itemPrice}>
                                                ₹{(itemPrice * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className={styles.removeBtn}
                                        aria-label="Remove item"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Cart Footer */}
                {cart.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.subtotal}>
                            <span>Subtotal</span>
                            <span className={styles.total}>₹{currentTotal.toLocaleString()}</span>
                        </div>

                        <p className={styles.taxNote}>Taxes and shipping calculated at checkout</p>

                        <div className={styles.actions}>
                            <Link
                                href="/cart"
                                className="btn btn-outline"
                                onClick={() => setIsCartOpen(false)}
                            >
                                View Cart
                            </Link>
                            <Link
                                href="/checkout"
                                className="btn btn-primary"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Checkout <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
