'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useNotification } from './NotificationContext'

const WishlistContext = createContext()

const STORAGE_KEY = 'marmex-wishlist'

function getStoredWishlist() {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function setStoredWishlist(items) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
        // ignore
    }
}

export function WishlistProvider({ children }) {
    const { data: session } = useSession()
    const notification = useNotification()
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(false)

    // Load wishlist on mount / session change
    useEffect(() => {
        if (session) {
            fetchWishlist()
        } else {
            // Guest: load from localStorage
            setWishlist(getStoredWishlist())
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

    const syncGuestWishlistToServer = useCallback(async (guestItems) => {
        if (!session || guestItems.length === 0) return
        try {
            // Bulk-add guest wishlist items to server
            await Promise.all(
                guestItems.map(id =>
                    fetch('/api/user/wishlist', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId: id })
                    }).catch(() => null)
                )
            )
            // Clear localStorage after sync
            localStorage.removeItem(STORAGE_KEY)
            // Refresh from server
            await fetchWishlist()
        } catch (error) {
            console.error('Failed to sync guest wishlist:', error)
        }
    }, [session])

    // Sync guest wishlist when user logs in
    useEffect(() => {
        if (session) {
            const guestItems = getStoredWishlist()
            if (guestItems.length > 0) {
                syncGuestWishlistToServer(guestItems)
            }
        }
    }, [session, syncGuestWishlistToServer])

    const addToWishlist = async (productId) => {
        if (!session) {
            // Guest: use localStorage
            const current = getStoredWishlist()
            if (!current.includes(productId)) {
                const updated = [...current, productId]
                setStoredWishlist(updated)
                setWishlist(updated)
                notification.success('Added to wishlist!')
            }
            return true
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
        if (!session) {
            // Guest: use localStorage
            const current = getStoredWishlist()
            const updated = current.filter(id => id !== productId)
            setStoredWishlist(updated)
            setWishlist(updated)
            notification.success('Removed from wishlist')
            return true
        }

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
