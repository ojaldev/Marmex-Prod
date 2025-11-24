'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/ui/ProductCard'
import RatingsSummary from '@/components/reviews/RatingsSummary'
import ReviewForm from '@/components/reviews/ReviewForm'
import ReviewList from '@/components/reviews/ReviewList'
import { useCart } from '@/contexts/CartContext'
import { convertGDriveUrl } from '@/lib/utils'
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    Share2,
    Truck,
    Shield,
    RotateCcw,
    Star
} from 'lucide-react'
import styles from './product-detail.module.css'

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { addToCart } = useCart()
    const [product, setProduct] = useState(null)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [wishlisted, setWishlisted] = useState(false)

    useEffect(() => {
        if (params.id) {
            loadProduct()
        }
    }, [params.id])

    const loadProduct = async () => {
        try {
            const [productRes, allProductsRes] = await Promise.all([
                fetch(`/api/products/${params.id}`),
                fetch('/api/products')
            ])

            const productData = await productRes.json()
            const allProducts = await allProductsRes.json()

            setProduct(productData)

            // Get related products (same category, exclude current)
            const related = allProducts
                .filter(p => p.category === productData.category && p.id !== productData.id)
                .slice(0, 4)

            setRelatedProducts(related)
        } catch (error) {
            console.error('Failed to load product:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <>
                <Header />
                <main className={styles.loading}>Loading product...</main>
                <Footer />
            </>
        )
    }

    if (!product) {
        return (
            <>
                <Header />
                <main className={styles.notFound}>
                    <h1>Product Not Found</h1>
                    <button onClick={() => router.push('/products')} className="btn btn-primary">
                        Browse Products
                    </button>
                </main>
                <Footer />
            </>
        )
    }

    // Convert Google Drive URLs and combine all images
    const allImages = [
        product.mainImage,
        ...(product.additionalImages || [])
    ].filter(Boolean).map(convertGDriveUrl)

    const discountedPrice = product.discount > 0
        ? (product.price * (100 - product.discount) / 100).toFixed(0)
        : null

    return (
        <>
            <Header />
            <main className={styles.productDetail}>
                <div className="container">
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <a href="/">Home</a>
                        <span>/</span>
                        <a href="/products">Products</a>
                        <span>/</span>
                        {product.category && (
                            <>
                                <a href={`/products?category=${product.category}`}>{product.category}</a>
                                <span>/</span>
                            </>
                        )}
                        <span>{product.name}</span>
                    </nav>

                    <div className={styles.layout}>
                        {/* Image Gallery */}
                        <div className={styles.gallery}>
                            <div className={styles.mainImage}>
                                {allImages[currentImageIndex] ? (
                                    <Image
                                        src={allImages[currentImageIndex]}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className={styles.image}
                                    />
                                ) : (
                                    <div className={styles.imagePlaceholder}>No Image</div>
                                )}

                                {/* Navigation Arrows */}
                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            className={`${styles.navBtn} ${styles.navPrev}`}
                                            onClick={() => setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)}
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            className={`${styles.navBtn} ${styles.navNext}`}
                                            onClick={() => setCurrentImageIndex(prev => (prev + 1) % allImages.length)}
                                            aria-label="Next image"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}

                                {/* Badges */}
                                {(product.highlight || product.discount > 0) && (
                                    <div className={styles.badges}>
                                        {product.highlight && (
                                            <span className={styles.badgeHighlight}>{product.highlight}</span>
                                        )}
                                        {product.discount > 0 && (
                                            <span className={styles.badgeDiscount}>-{product.discount}%</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className={styles.thumbnails}>
                                    {allImages.map((img, index) => (
                                        <button
                                            key={index}
                                            className={`${styles.thumbnail} ${index === currentImageIndex ? styles.thumbnailActive : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        >
                                            <Image src={img} alt={`View ${index + 1}`} fill className={styles.thumbImage} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className={styles.info}>
                            {product.category && (
                                <p className={styles.category}>{product.category}</p>
                            )}

                            <h1 className={styles.title}>{product.name}</h1>

                            {/* Rating */}
                            <div className={styles.rating}>
                                <div className={styles.stars}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={18} fill="currentColor" />
                                    ))}
                                </div>
                                <span className={styles.ratingText}>4.8 (24 reviews)</span>
                            </div>

                            {/* Price */}
                            <div className={styles.priceSection}>
                                {discountedPrice ? (
                                    <>
                                        <span className={styles.currentPrice}>₹{parseInt(discountedPrice).toLocaleString()}</span>
                                        <span className={styles.originalPrice}>₹{product.price?.toLocaleString()}</span>
                                        <span className={styles.saveAmount}>Save ₹{(product.price - parseInt(discountedPrice)).toLocaleString()}</span>
                                    </>
                                ) : (
                                    <span className={styles.currentPrice}>₹{product.price?.toLocaleString()}</span>
                                )}
                            </div>

                            {/* Description */}
                            {product.shortDescription && (
                                <p className={styles.description}>{product.shortDescription}</p>
                            )}

                            {/* Stock Status */}
                            <div className={styles.stock}>
                                <span className={product.stock === 'In Stock' ? styles.inStock : styles.lowStock}>
                                    {product.stock || 'In Stock'}
                                </span>
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className={styles.actions}>
                                <div className={styles.quantity}>
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                </div>

                                <button className={styles.addToCart} onClick={() => addToCart(product, quantity)}>
                                    Add to Cart
                                </button>

                                <button
                                    className={`${styles.iconBtn} ${wishlisted ? styles.wishlisted : ''}`}
                                    onClick={() => setWishlisted(!wishlisted)}
                                >
                                    <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                                </button>

                                <button className={styles.iconBtn}>
                                    <Share2 size={20} />
                                </button>
                            </div>

                            {/* Features */}
                            <div className={styles.features}>
                                <div className={styles.feature}>
                                    <Truck size={20} />
                                    <div>
                                        <strong>Free Shipping</strong>
                                        <p>On orders above ₹2,999</p>
                                    </div>
                                </div>
                                <div className={styles.feature}>
                                    <Shield size={20} />
                                    <div>
                                        <strong>Secure Payment</strong>
                                        <p>100% safe & encrypted</p>
                                    </div>
                                </div>
                                <div className={styles.feature}>
                                    <RotateCcw size={20} />
                                    <div>
                                        <strong>30-Day Returns</strong>
                                        <p>Hassle-free refunds</p>
                                    </div>
                                </div>
                            </div>

                            {/* Full Description */}
                            {product.detailedDescription && (
                                <div className={styles.fullDescription}>
                                    <h3>About This Product</h3>
                                    <p>{product.detailedDescription}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video Showcase */}
                    {product.videoUrl && (
                        <section className={styles.videoSection}>
                            <h2>See It In Action</h2>
                            <div className={styles.videoWrapper}>
                                <iframe
                                    src={product.videoUrl}
                                    title={`${product.name} video`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </section>
                    )}

                    {/* Reviews Section */}
                    <section className={styles.reviewsSection}>
                        <h2>Customer Reviews</h2>
                        <div className={styles.reviewsContainer}>
                            <div className={styles.reviewsSidebar}>
                                <RatingsSummary summary={null} />
                            </div>
                            <div className={styles.reviewsMain}>
                                <ReviewForm
                                    productId={product.id}
                                    onSuccess={() => {
                                        // Could refresh reviews here
                                        alert('Thank you for your review! It will be published after moderation.')
                                    }}
                                />
                                <ReviewList reviews={[]} productId={product.id} />
                            </div>
                        </div>
                    </section>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <section className={styles.relatedSection}>
                            <h2>You May Also Like</h2>
                            <div className={styles.relatedGrid}>
                                {relatedProducts.map(related => (
                                    <ProductCard key={related.id} product={related} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}
