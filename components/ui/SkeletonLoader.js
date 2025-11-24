import styles from './SkeletonLoader.module.css'

export function ProductCardSkeleton() {
    return (
        <div className={styles.productCard}>
            <div className={styles.imageSkeleton}></div>
            <div className={styles.content}>
                <div className={styles.categoryLine}></div>
                <div className={styles.titleLine}></div>
                <div className={styles.shortLine}></div>
                <div className={styles.priceLine}></div>
            </div>
        </div>
    )
}

export function ProductListSkeleton({ count = 6 }) {
    return (
        <div className={styles.grid}>
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}

export function TextSkeleton({ lines = 3 }) {
    return (
        <div className={styles.textSkeleton}>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className={styles.line}></div>
            ))}
        </div>
    )
}
