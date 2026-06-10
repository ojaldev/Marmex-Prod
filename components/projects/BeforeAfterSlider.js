'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import styles from './BeforeAfterSlider.module.css'

export default function BeforeAfterSlider({ beforeImage, afterImage, className = '' }) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasNudged, setHasNudged] = useState(false)
  const containerRef = useRef(null)
  const hasInteracted = useRef(false)

  // Viewport nudge: 50 → 66 → 50 over 1200ms, once, on first enter
  useEffect(() => {
    if (!containerRef.current || hasNudged) return
    let rafId
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasInteracted.current && !hasNudged) {
          setHasNudged(true)
          observer.disconnect()
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          if (prefersReduced) return
          const start = performance.now()
          const duration = 1200
          const animate = (now) => {
            const t = Math.min((now - start) / duration, 1)
            // ease in-out: go to 66 then back to 50
            const pos = t < 0.5
              ? 50 + 16 * (t / 0.5)
              : 66 - 16 * ((t - 0.5) / 0.5)
            setSliderPosition(Math.round(pos))
            if (t < 1 && !hasInteracted.current) {
              rafId = requestAnimationFrame(animate)
            } else if (!hasInteracted.current) {
              setSliderPosition(50)
            }
          }
          rafId = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(containerRef.current)
    return () => {
      observer.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [hasNudged])

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(2, Math.min(98, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    hasInteracted.current = true
    setIsDragging(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    handleMove(clientX)
  }, [handleMove])

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      e.preventDefault()
      handleMove(e.clientX)
    }
  }, [isDragging, handleMove])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX)
    }
  }, [isDragging, handleMove])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove])

  // Prevent image dragging
  const preventDrag = (e) => {
    e.preventDefault()
  }

  // If only one image, show it
  if (!beforeImage && !afterImage) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.emptyImage}>No Image</div>
      </div>
    )
  }

  if (!beforeImage || !afterImage) {
    const img = afterImage || beforeImage
    return (
      <div className={`${styles.container} ${className}`}>
        <img src={img} alt="Project" className={styles.singleImage} draggable={false} onDragStart={preventDrag} />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isDragging ? styles.dragging : ''} ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Before Image (full) */}
      <div className={styles.imageLayer}>
        <img
          src={beforeImage}
          alt="Before"
          className={styles.image}
          draggable={false}
          onDragStart={preventDrag}
        />
      </div>

      {/* After Image (clipped) */}
      <div
        className={styles.imageLayer}
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <img
          src={afterImage}
          alt="After"
          className={`${styles.image} ${isHovered ? styles.imageDepth : ''}`}
          draggable={false}
          onDragStart={preventDrag}
        />
      </div>

      {/* Dynamic Before Label - follows the divider from the left */}
      <div
        className={`${styles.label} ${styles.labelBefore}`}
        style={{
          left: `calc(${Math.min(sliderPosition - 8, 85)}% - 30px)`,
          opacity: sliderPosition > 12 ? 1 : 0,
          transform: `translateX(-100%)`,
        }}
      >
        Before
      </div>

      {/* Dynamic After Label - follows the divider from the right */}
      <div
        className={`${styles.label} ${styles.labelAfter}`}
        style={{
          left: `calc(${Math.max(sliderPosition + 8, 15)}% + 30px)`,
          opacity: sliderPosition < 88 ? 1 : 0,
          transform: `translateX(-100%)`,
        }}
      >
        After
      </div>

      {/* Divider Line */}
      <div
        className={styles.divider}
        style={{ left: `${sliderPosition}%` }}
      >
        <motion.div
          className={styles.handle}
          animate={{
            scale: isDragging ? 1.25 : isHovered ? 1.1 : 1,
            boxShadow: isDragging
              ? '0 0 24px rgba(212, 165, 116, 0.7)'
              : '0 4px 16px rgba(0,0,0,0.3)',
          }}
          transition={{ duration: 0.2 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 4L2 8L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M11 4L14 8L11 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>

      {/* Hint text */}
      {!isDragging && (
        <motion.div
          className={styles.dragHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.8 : 0 }}
          transition={{ duration: 0.3 }}
        >
          Drag to compare
        </motion.div>
      )}
    </div>
  )
}
