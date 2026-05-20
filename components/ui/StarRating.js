'use client'

import { Star } from 'lucide-react'

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 16,
  showValue = false,
  reviewCount,
  className = '',
}) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const emptyStars = maxStars - fullStars - (hasHalf ? 1 : 0)

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            size={size}
            className="text-[var(--color-gold-24k)] fill-[var(--color-gold-24k)]"
          />
        ))}
        {/* Half star */}
        {hasHalf && (
          <div className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="text-[var(--color-platinum)] absolute" />
            <div className="absolute overflow-hidden" style={{ width: size / 2 }}>
              <Star size={size} className="text-[var(--color-gold-24k)] fill-[var(--color-gold-24k)]" />
            </div>
          </div>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={size}
            className="text-[var(--color-platinum)]"
          />
        ))}
      </div>

      {showValue && (
        <span className="text-sm font-semibold text-[var(--color-obsidian)] ml-1">
          {rating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className="text-sm text-[var(--color-text-gray)]">
          ({reviewCount})
        </span>
      )}
    </div>
  )
}
