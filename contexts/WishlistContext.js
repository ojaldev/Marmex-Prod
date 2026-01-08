'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotification } from './NotificationContext'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
    const { data: session } = useSession()
    const notification = useNotification()
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(false)

    // Fetch wishlist when session changes
    useEffect(() => {
        if (session) {
            fetchWishlist()
        } else {
            setWishlist([])
        }
    }, [session])

    const fetchWishlist = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/user/wishlist')
            if (res.ok) {
                const data = await res.json()
                setWishlist(data.wishlist || [])
            }
        } catch (error) {
            console.error('Failed to fetch wishlist:', error)
        } finally {
            setLoading(false)
        }
    }

    const addToWishlist = async (productId) => {
        if (!session) {
            notification.error('Please login to add to wishlist')
            return false
        }

        try {
            const res = await fetch('/api/user/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            })

            if (res.ok) {
                const data = await res.json()
                setWishlist(data.wishlist || [...wishlist, productId])
                notification.success('Added to wishlist!')
                return true
            } else {
                notification.error('Failed to add to wishlist')
                return false
            }
        } catch (error) {
            console.error('Add to wishlist error:', error)
            notification.error('Failed to add to wishlist')
            return false
        }
    }

    const removeFromWishlist = async (productId) => {
        if (!session) return false

        try {
            const res = await fetch(`/api/user/wishlist?productId=${productId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                const data = await res.json()
                setWishlist(data.wishlist || wishlist.filter(id => id !== productId))
                notification.success('Removed from wishlist')
                return true
            } else {
                notification.error('Failed to remove from wishlist')
                return false
            }
        } catch (error) {
            console.error('Remove from wishlist error:', error)
            notification.error('Failed to remove from wishlist')
            return false
        }
    }

    const toggleWishlist = async (productId) => {
        if (isInWishlist(productId)) {
            return removeFromWishlist(productId)
        } else {
            return addToWishlist(productId)
        }
    }

    const isInWishlist = (productId) => {
        return wishlist.includes(productId)
    }

    const getWishlistCount = () => {
        return wishlist.length
    }

    return (
        <WishlistContext.Provider value={{
            wishlist,
            loading,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist,
            getWishlistCount,
            refreshWishlist: fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}
