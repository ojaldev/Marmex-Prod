'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/ui/ProductCard'
import StarRating from '@/components/ui/StarRating'
import QuantitySelector from '@/components/ui/QuantitySelector'
import PincodeChecker from '@/components/checkout/PincodeChecker'
import RatingsSummary from '@/components/reviews/RatingsSummary'
import ReviewForm from '@/components/reviews/ReviewForm'
import ReviewList from '@/components/reviews/ReviewList'
import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/contexts/NotificationContext'
import { convertGDriveUrl } from '@/lib/utils'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import {
    ChevronLeft, ChevronRight, Heart, Share2, Truck, Shield,
    RotateCcw, Instagram, X, ZoomIn, Check, Package
} from 'lucide-react'
import styles from './product-detail.module.css'

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { addToCart } = useCart()
    const notification = useNotification()

    const [product, setProduct] = useState(null)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [reviewSummary, setReviewSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [wishlisted, setWishlisted] = useState(false)
    const [imageZoom, setImageZoom] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)
    const [stickyVisible, setStickyVisible] = useState(false)

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const [productRes, allProductsRes] = await Promise.all([
                    fetch(`/api/products/${params.id}`),
                    fetch('/api/products')
                ])

                const productData = await productRes.json()
                const allProductsData = await allProductsRes.json()

                setProduct(productData)

                const productId = productData._id || productData.id
                if (productId) {
                    const reviewsRes = await fetch(`/api/reviews?productId=${productId}`)
                    const reviewsData = await reviewsRes.json()
                    setReviewSummary(reviewsData.summary || null)
                }

                const productsArray = Array.isArray(allProductsData) ? allProductsData : (allProductsData.products || [])
                const related = productsArray
                    .filter(p => p.category === productData.category && (p._id || p.id) !== (productData._id || productData.id))
                    .slice(0, 4)

                setRelatedProducts(related)
            } catch (error) {
                console.error('Failed to load product:', error)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) loadProduct()
    }, [params.id])

    // Sticky ATC visibility
    useEffect(() => {
        const handleScroll = () => {
            const actionsEl = document.getElementById('product-actions')
            if (actionsEl) {
                const rect = actionsEl.getBoundingClientRect()
                setStickyVisible(rect.bottom < 0)
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [loading])

    const handleShare = async () => {
        const shareData = { title: product?.name, text: product?.shortDescription, url: window.location.href }
        try {
            if (navigator.share) await navigator.share(shareData)
            else {
                await navigator.clipboard.writeText(window.location.href)
                notification.success('Link copied to clipboard!')
            }
        } catch (error) {
            if (error.name !== 'AbortError') notification.error('Failed to share')
        }
    }

    const handleAddToCart = () => {
        addToCart(product, quantity)
        setAddedToCart(true)
        notification.success(`${product.name} added to cart!`)
        setTimeout(() => setAddedToCart(false), 2000)
    }

    const handleWishlist = () => {
        setWishlisted(!wishlisted)
        notification[!wishlisted ? 'success' : 'info'](!wishlisted ? 'Added to wishlist!' : 'Removed from wishlist')
    }

    const handleImageMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setZoomPosition({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        })
    }

    const nextImage = useCallback(() => {
        setCurrentImageIndex(prev => (prev + 1) % allImages.length)
    }, [])

    const prevImage = useCallback(() => {
        setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)
    }, [])

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKey = (e) => {
            if (!lightboxOpen) return
            if (e.key === 'ArrowRight') nextImage()
            if (e.key === 'ArrowLeft') prevImage()
            if (e.key === 'Escape') setLightboxOpen(false)
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [lightboxOpen, nextImage, prevImage])

    if (loading) {
        return (
            <main className={styles.main}>
                <div className="container">
                    <div className="shimmer h-5 w-64 rounded mb-8" />
                    <div className={styles.layout}>
                        <div className="space-y-4">
                            <div className="shimmer w-full aspect-[3/4] rounded-2xl" />
                            <div className="flex gap-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="shimmer w-20 h-20 rounded-lg" />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6 pt-4">
                            <div className="shimmer h-4 w-24 rounded" />
                            <div className="shimmer h-10 w-3/4 rounded" />
                            <div className="shimmer h-8 w-40 rounded" />
                            <div className="shimmer h-20 w-full rounded" />
                            <div className="shimmer h-14 w-full rounded" />
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    if (!product) {
        return (
            <main className={styles.notFound}>
                <Package size={64} className="text-[var(--color-platinum)]" />
                <h1>Product Not Found</h1>
                <p>The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                <button onClick={() => router.push('/products')} className="btn btn-primary">
                    Browse Products
                </button>
            </main>
        )
    }

    const allImages = [product.mainImage, ...(product.additionalImages || [])]
        .filter(Boolean).map(convertGDriveUrl)

    const discountedPrice = product.discount > 0
        ? (product.price * (100 - product.discount) / 100).toFixed(0)
        : null

    return (
        <>
            <main className={styles.main}>
                <div className="container">
                    {/* Breadcrumbs */}
                    <motion.nav
                        className={styles.breadcrumbs}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <Link href="/products">Products</Link>
                        <span>/</span>
                        {product.category && (
                            <>
                                <Link href={`/products?category=${product.category}`}>{product.category}</Link>
                                <span>/</span>
                            </>
                        )}
                        <span>{product.name}</span>
                    </motion.nav>

                    <div className={styles.layout}>
                        {/* Image Gallery */}
                        <motion.div
                            className={styles.gallery}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div
                                className={`${styles.mainImage} ${imageZoom ? styles.zoomed : ''}`}
                                onMouseEnter={() => setImageZoom(true)}
                                onMouseLeave={() => setImageZoom(false)}
                                onMouseMove={handleImageMouseMove}
                                onClick={() => setLightboxOpen(true)}
                            >
                                {allImages[currentImageIndex] ? (
                                    <Image
                                        src={allImages[currentImageIndex]}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className={styles.image}
                                        style={imageZoom ? {
                                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                            transform: 'scale(1.8)',
                                            transition: 'transform 0.1s ease-out',
                                        } : {}}
                                        priority
                                    />
                                ) : (
                                    <div className={styles.imagePlaceholder}>No Image</div>
                                )}

                                {/* Zoom hint */}
                                <div className={styles.zoomHint}>
                                    <ZoomIn size={16} />
                                    <span>Click to enlarge</span>
                                </div>

                                {/* Navigation Arrows */}
                                {allImages.length > 1 && (
                                    <>
                                        <motion.button
                                            className={`${styles.navBtn} ${styles.navPrev}`}
                                            onClick={(e) => { e.stopPropagation(); prevImage() }}
                                            aria-label="Previous image"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ChevronLeft size={24} />
                                        </motion.button>
                                        <motion.button
                                            className={`${styles.navBtn} ${styles.navNext}`}
                                            onClick={(e) => { e.stopPropagation(); nextImage() }}
                                            aria-label="Next image"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ChevronRight size={24} />
                                        </motion.button>
                                    </>
                                )}

                                {/* Badges */}
                                <div className={styles.badges}>
                                    {product.highlight && (
                                        <span className={styles.badgeHighlight}>{product.highlight}</span>
                                    )}
                                    {product.discount > 0 && (
                                        <span className={styles.badgeDiscount}>-{product.discount}%</span>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className={styles.thumbnails}>
                                    {allImages.map((img, index) => (
                                        <motion.button
                                            key={index}
                                            className={`${styles.thumbnail} ${index === currentImageIndex ? styles.thumbnailActive : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Image src={img} alt={`View ${index + 1}`} fill className={styles.thumbImage} sizes="80px" />
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Product Info */}
                        <motion.div
                            className={styles.info}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {product.category && (
                                <Link href={`/products?category=${product.category}`} className={styles.category}>
                                    {product.category}
                                </Link>
                            )}

                            <h1 className={styles.title}>{product.name}</h1>

                            {/* Rating */}
                            {reviewSummary && (
                                <div className={styles.rating}>
                                    <StarRating
                                        rating={reviewSummary.averageRating || 0}
                                        reviewCount={reviewSummary.totalReviews || 0}
                                        showValue
                                        size={18}
                                    />
                                </div>
                            )}

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
                                <span className={product.stock === 'Out of Stock' ? styles.outOfStock : product.stock === 'Low Stock' ? styles.lowStock : styles.inStock}>
                                    {product.stock === 'Out of Stock' ? '✕ Out of Stock' : product.stock === 'Low Stock' ? '⚠ Low Stock' : '✓ In Stock'}
                                </span>
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className={styles.actions} id="product-actions">
                                <QuantitySelector value={quantity} onChange={setQuantity} />

                                <motion.button
                                    className={`${styles.addToCart} ${addedToCart ? styles.added : ''}`}
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 'Out of Stock'}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {addedToCart ? (
                                        <><Check size={20} /> Added to Cart</>
                                    ) : product.stock === 'Out of Stock' ? (
                                        'Out of Stock'
                                    ) : (
                                        <><ShoppingCartIcon size={20} /> Add to Cart</>
                                    )}
                                </motion.button>

                                <motion.button
                                    className={`${styles.iconBtn} ${wishlisted ? styles.wishlisted : ''}`}
                                    onClick={handleWishlist}
                                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                                </motion.button>

                                <motion.button
                                    className={styles.iconBtn}
                                    onClick={handleShare}
                                    aria-label="Share product"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Share2 size={20} />
                                </motion.button>
                            </div>

                            {/* Features */}
                            <div className={styles.features}>
                                <div className={styles.feature}>
                                    <Truck size={20} />
                                    <div><strong>Free Shipping</strong><p>On orders above ₹2,999</p></div>
                                </div>
                                <div className={styles.feature}>
                                    <Shield size={20} />
                                    <div><strong>Secure Payment</strong><p>100% safe & encrypted</p></div>
                                </div>
                                <div className={styles.feature}>
                                    <RotateCcw size={20} />
                                    <div><strong>30-Day Returns</strong><p>Hassle-free refunds</p></div>
                                </div>
                            </div>

                            {/* Pincode Delivery Check */}
                            <PincodeChecker
                                productWeight={product.weight ? parseFloat(product.weight.match(/[\d.]+/)?.[0] || 1) : 1}
                                codAvailable={product.price < 50000}
                            />

                            {/* Full Description */}
                            {product.detailedDescription && (
                                <motion.div
                                    className={styles.fullDescription}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                >
                                    <h3>About This Product</h3>
                                    <p>{product.detailedDescription}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Product Specifications */}
                    {(product.dimensions || product.material || product.color || product.weight) && (
                        <motion.section
                            className={styles.specsSection}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2>Product Specifications</h2>
                            <div className={styles.specsGrid}>
                                {product.dimensions && (
                                    <div className={styles.specItem}>
                                        <span className={styles.specLabel}>Dimensions</span>
                                        <span className={styles.specValue}>{product.dimensions}</span>
                                    </div>
                                )}
                                {product.material && (
                                    <div className={styles.specItem}>
                                        <span className={styles.specLabel}>Material</span>
                                        <span className={styles.specValue}>{product.material}</span>
                                    </div>
                                )}
                                {product.color && (
                                    <div className={styles.specItem}>
                                        <span className={styles.specLabel}>Color</span>
                                        <span className={styles.specValue}>{product.color}</span>
                                    </div>
                                )}
                                {product.weight && (
                                    <div className={styles.specItem}>
                                        <span className={styles.specLabel}>Weight</span>
                                        <span className={styles.specValue}>{product.weight}</span>
                                    </div>
                                )}
                                {product.category && (
                                    <div className={styles.specItem}>
                                        <span className={styles.specLabel}>Category</span>
                                        <span className={styles.specValue}>{product.category}</span>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    )}

                    {/* Video Showcase */}
                    {product.videoUrl && (
                        <motion.section
                            className={styles.videoSection}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
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
                        </motion.section>
                    )}

                    {/* Instagram Reel */}
                    {product.instagramReel && (
                        <motion.section
                            className={styles.instagramSection}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2>Featured on Instagram</h2>
                            <div className={styles.instagramWrapper}>
                                <a href={product.instagramReel} target="_blank" rel="noopener noreferrer" className={styles.instagramLink}>
                                    <Instagram size={24} />
                                    <span>Watch on Instagram</span>
                                </a>
                            </div>
                        </motion.section>
                    )}

                    {/* Reviews Section */}
                    <motion.section
                        className={styles.reviewsSection}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Customer Reviews</h2>
                        <div className={styles.reviewsContainer}>
                            <div className={styles.reviewsSidebar}>
                                <RatingsSummary summary={reviewSummary} />
                            </div>
                            <div className={styles.reviewsMain}>
                                <ReviewList reviews={[]} productId={product._id || product.id} />
                                <ReviewForm productId={product._id || product.id} onSuccess={() => {}} />
                            </div>
                        </div>
                    </motion.section>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <motion.section
                            className={styles.relatedSection}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2>You May Also Like</h2>
                            <motion.div
                                className={styles.relatedGrid}
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {relatedProducts.map(related => (
                                    <motion.div key={related.id} variants={fadeInUp}>
                                        <ProductCard product={related} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.section>
                    )}
                </div>
            </main>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        className={styles.lightbox}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxOpen(false)}
                    >
                        <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)}>
                            <X size={28} />
                        </button>
                        <motion.button
                            className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                            onClick={(e) => { e.stopPropagation(); prevImage() }}
                            whileHover={{ scale: 1.1 }}
                        >
                            <ChevronLeft size={32} />
                        </motion.button>
                        <motion.div
                            className={styles.lightboxImage}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={allImages[currentImageIndex]}
                                alt={product.name}
                                fill
                                className="object-contain"
                                sizes="90vw"
                                priority
                            />
                        </motion.div>
                        <motion.button
                            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                            onClick={(e) => { e.stopPropagation(); nextImage() }}
                            whileHover={{ scale: 1.1 }}
                        >
                            <ChevronRight size={32} />
                        </motion.button>
                        <div className={styles.lightboxCounter}>
                            {currentImageIndex + 1} / {allImages.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Mobile ATC Bar */}
            <AnimatePresence>
                {stickyVisible && (
                    <motion.div
                        className={styles.stickyBar}
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className={styles.stickyContent}>
                            <div className={styles.stickyInfo}>
                                <p className={styles.stickyName}>{product.name}</p>
                                <p className={styles.stickyPrice}>
                                    {discountedPrice
                                        ? `₹${parseInt(discountedPrice).toLocaleString()}`
                                        : `₹${product.price?.toLocaleString()}`
                                    }
                                </p>
                            </div>
                            <div className={styles.stickyActions}>
                                <QuantitySelector value={quantity} onChange={setQuantity} size="small" />
                                <motion.button
                                    className={`${styles.stickyAddToCart} ${addedToCart ? styles.added : ''}`}
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 'Out of Stock'}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {addedToCart ? <Check size={18} /> : 'Add to Cart'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

// Simple shopping cart icon component
function ShoppingCartIcon({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    )
}
