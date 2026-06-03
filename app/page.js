import HeroSection from '@/components/home/HeroSection'
import TrustBar from '@/components/home/TrustBar'
import CategoryTiles from '@/components/home/CategoryTiles'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import TrendingProducts from '@/components/home/TrendingProducts'
import PromoBanner from '@/components/home/PromoBanner'
import BrandStory from '@/components/home/BrandStory'
import VideoShowcase from '@/components/home/VideoShowcase'
import Testimonials from '@/components/home/Testimonials'


export default function Home() {
    return (
        <>
            <HeroSection />
            <TrustBar />
            <CategoryTiles />
            <FeaturedProducts />
            <TrendingProducts />
            <PromoBanner />
            <BrandStory />
            <VideoShowcase />
            <Testimonials />

        </>
    )
}
