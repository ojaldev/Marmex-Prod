import './globals.css'
import { fontDisplay, fontBody, fontAccent } from './fonts'
import Providers from '@/components/providers/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RouteScrollToTop from '@/components/layout/RouteScrollToTop'
import PageTransition from '@/components/layout/PageTransition'
import DynamicLayoutExtras from '@/components/layout/DynamicLayoutExtras'

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
        <html lang="en" className={`${fontDisplay.variable} ${fontBody.variable} ${fontAccent.variable}`}>
            <body className={fontBody.className}>
                <Providers>
                    <RouteScrollToTop />
                    <DynamicLayoutExtras />
                    <Header />
                    <PageTransition>
                        <main>{children}</main>
                    </PageTransition>
                    <Footer />
                </Providers>
            </body>
        </html>
    )
}
