'use client'

import { useEffect, useState, useCallback } from 'react'
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
import { useWishlist } from '@/contexts/WishlistContext'
import { useNotification } from '@/contexts/NotificationContext'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import { convertGDriveUrl } from '@/lib/utils'
import { normalizeDimensionsDisplay, normalizeWeightDisplay } from '@/lib/product-specs'
import { getCloudinarySrcSet } from '@/lib/cloudinary-responsive'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import {
    ChevronLeft, ChevronRight, Heart, Share2, Truck, Shield,
    RotateCcw, Instagram, X, ZoomIn, Check, Play,
    TrendingUp, Clock, Flame, MapPin, Layers
} from 'lucide-react'
import styles from './product-detail.module.css'

const RV_STORAGE_KEY = 'marmex-recently-viewed'
const RV_MAX_ITEMS = 8

function getRecentlyViewed() {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(RV_STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function trackRecentlyViewed(product) {
    if (typeof window === 'undefined') return
    try {
        const id = product._id || product.id
        if (!id) return
        const current = getRecentlyViewed()
        const filtered = current.filter(item => item !== id)
        const updated = [id, ...filtered].slice(0, RV_MAX_ITEMS)
        localStorage.setItem(RV_STORAGE_KEY, JSON.stringify(updated))
    } catch {
        // ignore
    }
}

export default function ProductDetailClient({
    product,
    allProducts = [],
    relatedProducts = [],
    reviewSummary = null,
    soldRecently = 0,
    featuredIn = []
}) {
    const { addToCart } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const notification = useNotification()

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [imageZoom, setImageZoom] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)
    const [stickyVisible, setStickyVisible] = useState(false)
    const [recentlyViewed, setRecentlyViewed] = useState([])

    const productId = product._id || product.id

    // Track recently viewed on mount
    useEffect(() => {
        trackRecentlyViewed(product)
        const rv = getRecentlyViewed().filter(id => id !== productId)
        const rvProducts = allProducts.filter(p => rv.includes(p._id || p.id)).slice(0, 4)
        setRecentlyViewed(rvProducts)
    }, [product, productId, allProducts])

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
    }, [])

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

    const wishlisted = isInWishlist(productId)

    const handleWishlist = () => {
        const price = discountedPrice ? Number(discountedPrice) : product.price
        toggleWishlist(productId, price)
    }

    const handleImageMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setZoomPosition({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        })
    }

    const allImages = [product.mainImage, ...(product.additionalImages || [])].filter(Boolean).map(convertGDriveUrl)
    const mediaItems = [
        ...allImages.map(src => ({ type: 'image', src })),
        ...(product.videos || []).map(v => ({ type: 'video', src: v.url, title: v.title }))
    ]

    const nextImage = useCallback(() => {
        setCurrentMediaIndex(prev => {
            const len = mediaItems.length || 1
            return (prev + 1) % len
        })
    }, [mediaItems.length])

    const prevImage = useCallback(() => {
        setCurrentMediaIndex(prev => {
            const len = mediaItems.length || 1
            return (prev - 1 + len) % len
        })
    }, [mediaItems.length])

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

    useEffect(() => {
        setCurrentMediaIndex(0)
    }, [productId])

    const discountedPrice = product.discount > 0
        ? (product.price * (100 - product.discount) / 100).toFixed(0)
        : null

    const getDeliveryEstimate = () => {
        const now = new Date()
        const cutoff = new Date(now)
        cutoff.setHours(16, 0, 0, 0)
        const hoursLeft = cutoff > now ? Math.ceil((cutoff - now) / (1000 * 60 * 60)) : 0
        const delivery = new Date(now)
        delivery.setDate(delivery.getDate() + (hoursLeft > 0 ? 5 : 6))
        const dayName = delivery.toLocaleDateString('en-IN', { weekday: 'short' })
        const dateStr = delivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        return { hoursLeft, deliveryText: `${dayName}, ${dateStr}` }
    }

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
                                className={`${styles.mainImage} ${imageZoom && mediaItems[currentMediaIndex]?.type === 'image' ? styles.zoomed : ''}`}
                                onMouseEnter={() => mediaItems[currentMediaIndex]?.type === 'image' && setImageZoom(true)}
                                onMouseLeave={() => setImageZoom(false)}
                                onMouseMove={handleImageMouseMove}
                                onClick={() => setLightboxOpen(true)}
                            >
                                {mediaItems.length > 0 ? (
                                    mediaItems[currentMediaIndex]?.type === 'video' ? (
                                        <video
                                            src={mediaItems[currentMediaIndex].src}
                                            className={styles.videoPlayer}
                                            controls
                                            autoPlay
                                            playsInline
                                        />
                                    ) : (
                                        <Image
                                            src={mediaItems[currentMediaIndex].src}
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
                                    )
                                ) : (
                                    <div className={styles.imagePlaceholder}>No Image</div>
                                )}

                                {mediaItems[currentMediaIndex]?.type === 'image' && (
                                    <div className={styles.zoomHint}>
                                        <ZoomIn size={16} />
                                        <span>Click to enlarge</span>
                                    </div>
                                )}

                                {mediaItems.length > 1 && (
                                    <>
                                        <motion.button
                                            className={`${styles.navBtn} ${styles.navPrev}`}
                                            onClick={(e) => { e.stopPropagation(); prevImage() }}
                                            aria-label="Previous media"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ChevronLeft size={24} />
                                        </motion.button>
                                        <motion.button
                                            className={`${styles.navBtn} ${styles.navNext}`}
                                            onClick={(e) => { e.stopPropagation(); nextImage() }}
                                            aria-label="Next media"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ChevronRight size={24} />
                                        </motion.button>
                                    </>
                                )}

                                <div className={styles.badges}>
                                    {product.highlight && (
                                        <span className={styles.badgeHighlight}>{product.highlight}</span>
                                    )}
                                    {product.discount > 0 && (
                                        <span className={styles.badgeDiscount}>-{product.discount}%</span>
                                    )}
                                </div>
                            </div>

                            {mediaItems.length > 1 && (
                                <div className={styles.thumbnails}>
                                    {mediaItems.map((item, index) => (
                                        <motion.button
                                            key={index}
                                            className={`${styles.thumbnail} ${index === currentMediaIndex ? styles.thumbnailActive : ''}`}
                                            onClick={() => setCurrentMediaIndex(index)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {item.type === 'video' ? (
                                                <div className={styles.thumbVideo}>
                                                    <video src={item.src} preload="metadata" />
                                                    <div className={styles.thumbPlayIcon}>
                                                        <Play size={16} color="white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <Image src={item.src} alt={`View ${index + 1}`} fill className={styles.thumbImage} sizes="80px" />
                                            )}
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

                            {reviewSummary && (
                                <div className={styles.rating}>
                                    <StarRating
                                        rating={reviewSummary.average || 0}
                                        reviewCount={reviewSummary.total || 0}
                                        showValue
                                        size={18}
                                    />
                                </div>
                            )}

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

                            {product.shortDescription && (
                                <p className={styles.description}>{product.shortDescription}</p>
                            )}

                            {/* Urgency Bar */}
                            <div className={styles.urgencyBar}>
                                {product.stock === 'Low Stock' && (
                                    <div className={styles.urgencyItem + ' ' + styles.urgencyLowStock}>
                                        <Flame size={14} />
                                        <span>Only a few left — selling fast!</span>
                                    </div>
                                )}
                                {product.stock !== 'Out of Stock' && soldRecently >= 3 && (
                                    <div className={styles.urgencyItem + ' ' + styles.urgencyViewers}>
                                        <TrendingUp size={14} />
                                        <span>{soldRecently} sold in the last 30 days</span>
                                    </div>
                                )}
                                {product.stock !== 'Out of Stock' && (() => {
                                    const { hoursLeft, deliveryText } = getDeliveryEstimate()
                                    return (
                                        <div className={styles.urgencyItem + ' ' + styles.urgencyDelivery}>
                                            <Clock size={14} />
                                            <span>
                                                {hoursLeft > 0
                                                    ? `Order in ${hoursLeft}h for delivery by ${deliveryText}`
                                                    : `Order now for delivery by ${deliveryText}`}
                                            </span>
                                        </div>
                                    )
                                })()}
                            </div>

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

                            {/* Bulk Quote CTA */}
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'd like a bulk quote for: ${product.name}\n${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.bulkQuote}
                            >
                                Buying in bulk? Get a custom quote
                            </a>

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

                            <PincodeChecker
                                productWeight={product.weight || '1'}
                                codAvailable={product.price < 50000}
                            />

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
                                        <span className={styles.specValue}>{normalizeDimensionsDisplay(product.dimensions)}</span>
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
                                        <span className={styles.specValue}>{normalizeWeightDisplay(product.weight)}</span>
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
                                <ReviewList reviews={[]} productId={productId} />
                                <ReviewForm productId={productId} onSuccess={() => {}} />
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
                                    <div key={related._id || related.id}>
                                        <ProductCard product={related} />
                                    </div>
                                ))}
                            </motion.div>
                        </motion.section>
                    )}

                    {/* Seen in real projects */}
                    {featuredIn.length > 0 && (
                        <motion.section
                            className={styles.featuredInSection}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className={styles.featuredInTitle}>
                                <Layers size={20} />
                                Seen in Real Projects
                            </h2>
                            <div className={styles.featuredInGrid}>
                                {featuredIn.map(proj => {
                                    const projId = proj._id || proj.id
                                    return (
                                        <Link
                                            key={projId}
                                            href={`/projects?open=${projId}`}
                                            className={styles.featuredInCard}
                                        >
                                            <div className={styles.featuredInImage}>
                                                {proj.afterImage && (
                                                    <Image
                                                        src={proj.afterImage}
                                                        alt={proj.name}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 360px"
                                                        className={styles.featuredInImg}
                                                    />
                                                )}
                                                {proj.projectType && (
                                                    <span className={styles.featuredInBadge}>
                                                        {proj.projectType === 'commercial' ? 'Commercial' : 'Residential'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.featuredInInfo}>
                                                <p className={styles.featuredInName}>{proj.name}</p>
                                                {proj.location && (
                                                    <p className={styles.featuredInLocation}>
                                                        <MapPin size={12} />
                                                        {proj.location}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </motion.section>
                    )}

                    {/* Recently Viewed */}
                    {recentlyViewed.length > 0 && (
                        <motion.section
                            className={styles.relatedSection}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2>Recently Viewed</h2>
                            <motion.div
                                className={styles.relatedGrid}
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {recentlyViewed.map(rv => (
                                    <div key={rv._id || rv.id}>
                                        <ProductCard product={rv} />
                                    </div>
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
                        key="lightbox"
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
                            key={currentMediaIndex}
                            className={styles.lightboxImage}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {mediaItems[currentMediaIndex]?.type === 'video' ? (
                                <video
                                    src={mediaItems[currentMediaIndex].src}
                                    className={styles.lightboxImg}
                                    controls
                                    autoPlay
                                    playsInline
                                />
                            ) : (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={mediaItems[currentMediaIndex]?.src}
                                    alt={product.name}
                                    className={styles.lightboxImg}
                                    srcSet={getCloudinarySrcSet(mediaItems[currentMediaIndex]?.src, [640, 1080, 1440, 1920])}
                                    sizes="100vw"
                                />
                            )}
                        </motion.div>
                        <motion.button
                            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                            onClick={(e) => { e.stopPropagation(); nextImage() }}
                            whileHover={{ scale: 1.1 }}
                        >
                            <ChevronRight size={32} />
                        </motion.button>
                        <div className={styles.lightboxCounter}>
                            {currentMediaIndex + 1} / {mediaItems.length}
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

function ShoppingCartIcon({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    )
}
