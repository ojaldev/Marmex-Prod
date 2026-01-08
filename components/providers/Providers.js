'use client'

import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import AuthProvider from '@/components/providers/AuthProvider'
import ToastContainer from '@/components/ui/Toast'

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                <CartProvider>
                    <WishlistProvider>
                        {children}
                        <ToastContainer />
                    </WishlistProvider>
                </CartProvider>
            </NotificationProvider>
        </AuthProvider>
    )
}

