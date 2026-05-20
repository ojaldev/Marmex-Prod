'use client'

import styles from './SkeletonLoader.module.css'

export function ProductCardSkeleton() {
  return (
    <div className={styles.productCard}>
      <div className={`${styles.imageSkeleton} shimmer`} />
      <div className={styles.content}>
        <div className={`${styles.categoryLine} shimmer`} />
        <div className={`${styles.titleLine} shimmer`} />
        <div className={`${styles.shortLine} shimmer`} />
        <div className={`${styles.priceLine} shimmer`} />
      </div>
    </div>
  )
}

export function ProductListSkeleton({ count = 6, columns = 3 }) {
  return (
    <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TextSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`${styles.textSkeleton} ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`${styles.line} shimmer`} style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className={styles.heroSkeleton}>
      <div className={`${styles.heroMain} shimmer`} />
      <div className={`${styles.heroImage} shimmer`} />
      <div className={`${styles.heroAccent} shimmer`} />
      <div className={`${styles.heroAccent} shimmer`} />
    </div>
  )
}

export function CartItemSkeleton() {
  return (
    <div className={styles.cartItem}>
      <div className={`${styles.cartImage} shimmer`} />
      <div className={styles.cartInfo}>
        <div className={`${styles.cartTitle} shimmer`} />
        <div className={`${styles.cartPrice} shimmer`} />
      </div>
    </div>
  )
}
