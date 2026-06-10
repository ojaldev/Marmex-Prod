'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Calendar, Ruler, Star, Tag, Play, Quote, User, Building2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import BeforeAfterSlider from './BeforeAfterSlider'
import { modalOverlay, modalContent, easing } from '@/lib/animations'
import styles from './ProjectDetailModal.module.css'

export default function ProjectDetailModal({ project, onClose }) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [handleEscape])

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  if (!project) return null

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className={styles.overlay}
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              className={styles.closeBtn}
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} />
            </motion.button>

            {/* Modal Content */}
            <div className={styles.scrollContent}>
              {/* Hero Section with Before/After */}
              <div className={styles.heroSection}>
                <BeforeAfterSlider
                  beforeImage={project.beforeImage}
                  afterImage={project.afterImage}
                  className={styles.heroSlider}
                />

                {/* Featured Ribbon */}
                {project.featured && (
                  <div className={styles.featuredRibbon}>
                    <Star size={14} fill="currentColor" />
                    Featured Project
                  </div>
                )}
              </div>

              {/* Title & Meta */}
              <div className={styles.headerSection}>
                <motion.h2
                  className={styles.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: easing.outExpo }}
                >
                  {project.name}
                </motion.h2>

                {project.client && (
                  <motion.p
                    className={styles.subtitle}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5, ease: easing.outExpo }}
                  >
                    <Building2 size={16} />
                    Project for <strong>{project.client}</strong>
                  </motion.p>
                )}

                <motion.div
                  className={styles.metaBar}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: easing.outExpo }}
                >
                  {project.category && (
                    <span className={styles.metaBadge}>{project.category}</span>
                  )}
                  {project.location && (
                    <span className={styles.metaItem}>
                      <MapPin size={14} />
                      {project.location}
                    </span>
                  )}
                  {project.completionDate && (
                    <span className={styles.metaItem}>
                      <Calendar size={14} />
                      {formatDate(project.completionDate)}
                    </span>
                  )}
                  {project.dimensions && (
                    <span className={styles.metaItem}>
                      <Ruler size={14} />
                      {project.dimensions}
                    </span>
                  )}
                </motion.div>

                {project.tags && project.tags.length > 0 && (
                  <motion.div
                    className={styles.tagsRow}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                  >
                    <Tag size={14} />
                    {project.tags.map((tag, i) => (
                      <span key={i} className={styles.tag}>{tag}</span>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Shop this look */}
              {project.relatedProducts?.filter(Boolean).length > 0 && (
                <motion.div
                  className={styles.shopThisLook}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: easing.elegant }}
                >
                  <h3 className={styles.shopTitle}>
                    <ShoppingBag size={18} />
                    Shop this look
                  </h3>
                  <div className={styles.shopGrid}>
                    {project.relatedProducts.filter(Boolean).map(prod => {
                      const id = prod._id || prod.id
                      const effectivePrice = prod.discount > 0
                        ? Math.round(prod.price * (100 - prod.discount) / 100)
                        : prod.price
                      return (
                        <Link key={id} href={`/products/${id}`} className={styles.shopCard}>
                          <div className={styles.shopImage}>
                            {prod.mainImage && (
                              <Image src={prod.mainImage} alt={prod.name} fill sizes="120px" className={styles.shopImg} />
                            )}
                          </div>
                          <div className={styles.shopInfo}>
                            <p className={styles.shopName}>{prod.name}</p>
                            <p className={styles.shopPrice}>₹{effectivePrice?.toLocaleString()}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Two Column Layout */}
              <div className={styles.twoColumn}>
                {/* Left Column - Description */}
                <motion.div
                  className={styles.leftColumn}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.5, ease: easing.elegant }}
                >
                  {project.description && (
                    <div className={styles.block}>
                      <h3 className={styles.blockTitle}>Overview</h3>
                      <p className={styles.blockText}>{project.description}</p>
                    </div>
                  )}

                  {project.longDescription && (
                    <div className={styles.block}>
                      <h3 className={styles.blockTitle}>Details</h3>
                      <p className={styles.blockText}>{project.longDescription}</p>
                    </div>
                  )}

                  {project.materials && (
                    <div className={styles.block}>
                      <h3 className={styles.blockTitle}>Materials Used</h3>
                      <div className={styles.materialsBox}>
                        {project.materials}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Right Column - Media & Testimonials */}
                <motion.div
                  className={styles.rightColumn}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: easing.elegant }}
                >
                  {/* Installation Video */}
                  {project.installationVideo && getYouTubeEmbedUrl(project.installationVideo) && (
                    <div className={styles.block}>
                      <h3 className={styles.blockTitle}>
                        <Play size={16} />
                        Installation Video
                      </h3>
                      <div className={styles.videoWrapper}>
                        <iframe
                          src={getYouTubeEmbedUrl(project.installationVideo)}
                          title="Installation Video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* Testimonial Video */}
                  {project.testimonialVideo && getYouTubeEmbedUrl(project.testimonialVideo) && (
                    <div className={styles.block}>
                      <h3 className={styles.blockTitle}>
                        <Play size={16} />
                        Client Testimonial Video
                      </h3>
                      <div className={styles.videoWrapper}>
                        <iframe
                          src={getYouTubeEmbedUrl(project.testimonialVideo)}
                          title="Testimonial Video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* Client Testimonial */}
                  {project.clientTestimonial && (
                    <div className={styles.block}>
                      <h3 className={styles.blockTitle}>
                        <Quote size={16} />
                        Client Testimonial
                      </h3>
                      <div className={styles.testimonialBox}>
                        <Quote size={24} className={styles.quoteIcon} />
                        <blockquote className={styles.testimonialText}>
                          &ldquo;{project.clientTestimonial}&rdquo;
                        </blockquote>
                        {project.client && (
                          <cite className={styles.testimonialAuthor}>
                            <User size={14} />
                            {project.client}
                          </cite>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
