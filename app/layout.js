import './globals.css'
import Providers from '@/components/providers/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollProgress from '@/components/layout/ScrollProgress'
import ScrollToTop from '@/components/layout/ScrollToTop'
import RouteScrollToTop from '@/components/layout/RouteScrollToTop'
import PageTransition from '@/components/layout/PageTransition'

export const metadata = {
    title: 'Marmex India - Premium Marble Art & Sculptures',
    description: 'Exquisite handcrafted marble art, sculptures, and luxury gifts by Marmex India. Discover timeless craftsmanship for your home and loved ones.',
    keywords: 'marble art, sculptures, marble gifts, handcrafted, luxury, Indian marble, stone art, home decor',
    openGraph: {
        title: 'Marmex India - Premium Marble Art & Sculptures',
        description: 'Exquisite handcrafted marble art, sculptures, and luxury gifts',
        type: 'website',
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <RouteScrollToTop />
                    <ScrollProgress />
                    <Header />
                    <PageTransition>
                        <main>{children}</main>
                    </PageTransition>
                    <Footer />
                    <ScrollToTop />
                </Providers>
            </body>
        </html>
    )
}
