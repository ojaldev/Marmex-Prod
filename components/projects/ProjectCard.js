'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { MapPin, Star, Calendar, ExternalLink } from 'lucide-react'
import BeforeAfterSlider from './BeforeAfterSlider'
import { easing } from '@/lib/animations'
import styles from './ProjectCard.module.css'

export default function ProjectCard({ project, index, onViewDetails }) {
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  // 3D Tilt motion values
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 20 }
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), springConfig)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), springConfig)

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }, [x, y])

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
    })
  }

  return (
    <motion.div
      ref={cardRef}
      className={styles.cardWrapper}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: easing.elegant,
      }}
    >
      <motion.div
        className={styles.card}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ z: 20 }}
        transition={{ duration: 0.4 }}
      >
        {/* Gold border glow on hover */}
        <motion.div
          className={styles.borderGlow}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Image Section */}
        <div className={styles.imageSection} style={{ transform: 'translateZ(30px)' }}>
          <BeforeAfterSlider
            beforeImage={project.beforeImage}
            afterImage={project.afterImage}
            className={styles.slider}
          />

          {/* Badges */}
          <div className={styles.badges}>
            {project.featured && (
              <motion.span
                className={`${styles.badge} ${styles.badgeFeatured}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Star size={12} fill="currentColor" />
                Featured
              </motion.span>
            )}
            {project.category && (
              <span className={`${styles.badge} ${styles.badgeCategory}`}>
                {project.category}
              </span>
            )}
          </div>

          {/* View Details Button */}
          <motion.button
            className={styles.viewBtn}
            onClick={() => onViewDetails(project)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink size={14} />
            View Details
          </motion.button>
        </div>

        {/* Info Section */}
        <div className={styles.infoSection} style={{ transform: 'translateZ(20px)' }}>
          <div className={styles.infoHeader}>
            <h3 className={styles.title}>{project.name}</h3>
            {project.client && (
              <p className={styles.client}>for {project.client}</p>
            )}
          </div>

          <div className={styles.metaRow}>
            {project.location && (
              <span className={styles.meta}>
                <MapPin size={14} />
                {project.location}
              </span>
            )}
            {project.completionDate && (
              <span className={styles.meta}>
                <Calendar size={14} />
                {formatDate(project.completionDate)}
              </span>
            )}
          </div>

          {project.description && (
            <p className={styles.description}>{project.description}</p>
          )}

          {project.materials && (
            <div className={styles.materials}>
              <span className={styles.materialsLabel}>Materials:</span>
              <span className={styles.materialsValue}>{project.materials}</span>
            </div>
          )}

          {project.tags && project.tags.length > 0 && (
            <div className={styles.tags}>
              {project.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
