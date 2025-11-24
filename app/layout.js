import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CartProvider } from '@/contexts/CartContext'
import AuthProvider from '@/components/providers/AuthProvider'

export const metadata = {
    title: 'Marmex India - Premium Marble Art & Sculptures',
    description: 'Exquisite handcrafted marble art, sculptures, and luxury gifts by Marmex India',
    keywords: 'marble art, sculptures, marble gifts, handcrafted, luxury, Indian marble'
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <CartProvider>
                        <Header />
                        {children}
                        <Footer />
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
