import HeroSection from '@/components/home/HeroSection'
import TrustBar from '@/components/home/TrustBar'
import CategoryTiles from '@/components/home/CategoryTiles'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import BrandStory from '@/components/home/BrandStory'
import VideoShowcase from '@/components/home/VideoShowcase'
import Testimonials from '@/components/home/Testimonials'

export default function Home() {
    return (
        <main>
            <HeroSection />
            <TrustBar />
            <CategoryTiles />
            <FeaturedProducts />
            <BrandStory />
            <VideoShowcase />
            <Testimonials />
        </main>
    )
}
