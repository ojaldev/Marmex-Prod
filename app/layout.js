import './globals.css'
import { fontDisplay, fontBody, fontAccent } from './fonts'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Category from '@/models/Category'
import Providers from '@/components/providers/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import RouteScrollToTop from '@/components/layout/RouteScrollToTop'
import PageTransition from '@/components/layout/PageTransition'
import DynamicLayoutExtras from '@/components/layout/DynamicLayoutExtras'

export const metadata = {
    title: 'Marmex India — Handcrafted Stone Desk & Shelf Objects',
    description: 'Premium marble bookends, card holders, desk organizers, and stone décor handcrafted in India. Elevate your workspace with timeless stone craftsmanship.',
    keywords: 'marble bookends, stone desk decor, marble office accessories, handcrafted stone, marble gifts, shelf decor',
    openGraph: {
        title: 'Marmex India — Handcrafted Stone Desk & Shelf Objects',
        description: 'Premium marble bookends, card holders, desk organizers, and stone décor handcrafted in India.',
        type: 'website',
    },
}

async function getActiveCategories() {
    try {
        await connectDB()
        const [products, categories] = await Promise.all([
            Product.find({}).select('category').lean(),
            Category.find({}).sort({ order: 1, name: 1 }).lean()
        ])
        const catsWithCount = categories.map(cat => ({
            ...JSON.parse(JSON.stringify(cat)),
            count: products.filter(p => p.category === cat.name).length
        }))
        return catsWithCount.filter(c => c.count > 0)
    } catch (error) {
        console.error('Layout: failed to fetch categories:', error)
        return []
    }
}

export default async function RootLayout({ children }) {
    const activeCategories = await getActiveCategories()

    return (
        <html lang="en" className={`${fontDisplay.variable} ${fontBody.variable} ${fontAccent.variable}`}>
            <body className={fontBody.className}>
                <Providers>
                    <RouteScrollToTop />
                    <DynamicLayoutExtras />
                    <AnnouncementBar />
                    <Header categories={activeCategories} />
                    <PageTransition>
                        <main>{children}</main>
                    </PageTransition>
                    <Footer categories={activeCategories} />
                    <WhatsAppButton />
                </Providers>
            </body>
        </html>
    )
}
