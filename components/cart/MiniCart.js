'use client'

import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { X, Minus, Plus, ShoppingBag, ArrowRight, Truck, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getDeliveryEstimate, formatDeliveryDate } from '@/lib/delivery'
import styles from './MiniCart.module.css'

export default function MiniCart() {
    const {
        cart, isCartOpen, setIsCartOpen,
        updateQuantity, removeFromCart,
        getCartTotal, getCartCount
    } = useCart()

    const itemsEndRef = useRef(null)
    const prevCartLength = useRef(cart.length)
    const [deliveryEstimate, setDeliveryEstimate] = useState(null)

    // Load the pincode the user checked on a product page
    useEffect(() => {
        if (isCartOpen) setDeliveryEstimate(getDeliveryEstimate())
    }, [isCartOpen])

    const freeShippingThreshold = 2999
    const currentTotal = getCartTotal()
    const amountToFreeShipping = Math.max(0, freeShippingThreshold - currentTotal)
    const shippingProgress = Math.min((currentTotal / freeShippingThreshold) * 100, 100)

    // Scroll to bottom when a new item is added
    useEffect(() => {
        if (cart.length > prevCartLength.current && itemsEndRef.current) {
            itemsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
        prevCartLength.current = cart.length
    }, [cart.length])

    // Lock body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isCartOpen])

    if (!isCartOpen) return null

    return (
        <>
            {/* Overlay */}
            <div className={styles.overlay} onClick={() => setIsCartOpen(false)} />

            {/* Mini Cart Sidebar */}
            <div className={styles.miniCart}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.title}>
                        <ShoppingBag size={22} />
                        <h2>Your Cart</h2>
                        <span className={styles.badge}>{getCartCount()}</span>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setIsCartOpen(false)}
                        aria-label="Close cart"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Compact Shipping Progress */}
                <div className={styles.shippingBar}>
                    <div className={styles.shippingBarTrack}>
                        <div
                            className={styles.shippingBarFill}
                            style={{ width: `${shippingProgress}%` }}
                        />
                    </div>
                    <p className={styles.shippingBarText}>
                        {currentTotal >= freeShippingThreshold ? (
                            <><Truck size={12} /> Free shipping unlocked!</>
                        ) : (
                            <><Truck size={12} /> Add <strong>₹{amountToFreeShipping.toLocaleString()}</strong> for free shipping</>
                        )}
                    </p>
                    {cart.length > 0 && deliveryEstimate && formatDeliveryDate(deliveryEstimate.estimatedDays) && (
                        <p className={styles.deliveryEstimate}>
                            <MapPin size={12} />
                            Delivers to <strong>{deliveryEstimate.pincode}</strong> by {formatDeliveryDate(deliveryEstimate.estimatedDays)}
                        </p>
                    )}
                </div>

                {/* Cart Items */}
                <div className={styles.itemsContainer}>
                    {cart.length === 0 ? (
                        <div className={styles.empty}>
                            <ShoppingBag size={56} className={styles.emptyIcon} />
                            <p className={styles.emptyTitle}>Your cart is empty</p>
                            <p className={styles.emptySub}>Discover beautiful marble art for your home</p>
                            <Link href="/products" className="btn btn-primary" onClick={() => setIsCartOpen(false)}>
                                Explore Products
                            </Link>
                        </div>
                    ) : (
                        <>
                            {cart.map((item, index) => {
                                const itemId = item.id || item._id
                                const itemPrice = item.discount > 0
                                    ? item.price * (100 - item.discount) / 100
                                    : item.price
                                const isLast = index === cart.length - 1

                                return (
                                    <div
                                        key={itemId}
                                        className={`${styles.cartItem} ${isLast ? styles.lastItem : ''}`}
                                        ref={isLast ? itemsEndRef : null}
                                    >
                                        <div className={styles.itemImage}>
                                            {item.mainImage ? (
                                                <Image
                                                    src={item.mainImage}
                                                    alt={item.name}
                                                    fill
                                                    className={styles.image}
                                                    sizes="80px"
                                                />
                                            ) : (
                                                <div className={styles.imagePlaceholder}>No Image</div>
                                            )}
                                        </div>

                                        <div className={styles.itemDetails}>
                                            <Link
                                                href={`/products/${itemId}`}
                                                className={styles.itemName}
                                                onClick={() => setIsCartOpen(false)}
                                            >
                                                {item.name}
                                            </Link>

                                            {item.discount > 0 && (
                                                <span className={styles.itemDiscount}>
                                                    {item.discount}% off
                                                </span>
                                            )}

                                            <div className={styles.itemFooter}>
                                                <div className={styles.quantityControl}>
                                                    <button
                                                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                                        className={styles.quantityBtn}
                                                        aria-label="Decrease quantity"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={12} strokeWidth={2.5} />
                                                    </button>
                                                    <span className={styles.quantity}>{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                                        className={styles.quantityBtn}
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus size={12} strokeWidth={2.5} />
                                                    </button>
                                                </div>

                                                <span className={styles.itemPrice}>
                                                    ₹{(itemPrice * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(itemId)}
                                            className={styles.removeBtn}
                                            aria-label="Remove item"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.subtotalRow}>
                            <span>Subtotal</span>
                            <span className={styles.subtotalAmount}>₹{currentTotal.toLocaleString()}</span>
                        </div>
                        <p className={styles.taxNote}>Shipping & taxes calculated at checkout</p>

                        <div className={styles.actions}>
                            <Link
                                href="/cart"
                                className={`btn btn-outline ${styles.actionBtn}`}
                                onClick={() => setIsCartOpen(false)}
                            >
                                View Cart
                            </Link>
                            <Link
                                href="/checkout"
                                className={`btn btn-primary ${styles.actionBtn}`}
                                onClick={() => setIsCartOpen(false)}
                            >
                                Checkout <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
