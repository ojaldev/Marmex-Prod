'use client'

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { parseWeight } from '@/lib/shiprocket-order'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('marmex-cart')
        if (savedCart) {
            setCart(JSON.parse(savedCart))
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('marmex-cart', JSON.stringify(cart))
    }, [cart])

    const addToCart = useCallback((product, quantity = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id)

            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            return [...prevCart, { ...product, quantity }]
        })

        setIsCartOpen(true) // Open mini cart when item added
    }, [])

    const removeFromCart = useCallback((productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId))
    }, [])

    const updateQuantity = useCallback((productId, quantity) => {
        if (quantity <= 0) {
            setCart(prevCart => prevCart.filter(item => item.id !== productId))
            return
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        )
    }, [])

    const clearCart = useCallback(() => {
        setCart([])
    }, [])

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => {
            const price = item.discount > 0
                ? item.price * (100 - item.discount) / 100
                : item.price
            return total + (price * item.quantity)
        }, 0)
    }, [cart])

    const getCartCount = useCallback(() => {
        return cart.reduce((count, item) => count + item.quantity, 0)
    }, [cart])

    const getCartWeight = useCallback(() => {
        return cart.reduce((total, item) => {
            const weightKg = parseWeight(item.weight)
            return total + (weightKg * item.quantity)
        }, 0)
    }, [cart])

    const value = useMemo(() => ({
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getCartWeight,
        isCartOpen,
        setIsCartOpen
    }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, getCartWeight, isCartOpen])

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within CartProvider')
    }
    return context
}
