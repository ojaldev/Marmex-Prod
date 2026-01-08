import './globals.css'
import Providers from '@/components/providers/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
    title: 'Marmex India - Premium Marble Art & Sculptures',
    description: 'Exquisite handcrafted marble art, sculptures, and luxury gifts by Marmex India',
    keywords: 'marble art, sculptures, marble gifts, handcrafted, luxury, Indian marble'
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <Header />
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    )
}
