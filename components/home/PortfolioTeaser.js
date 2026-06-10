'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { easing } from '@/lib/animations'
import styles from './PortfolioTeaser.module.css'

export default function PortfolioTeaser() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => {
        const list = d.projects || d || []
        // Prefer featured projects first, then fill from the rest, up to 8
        const featured = list.filter(p => p.featured)
        const rest = list.filter(p => !p.featured)
        const combined = [...featured, ...rest].slice(0, 8)
        setProjects(combined)
      })
      .catch(() => {})
  }, [])

  if (projects.length === 0) return null

  // Pad to at least 5 items so the loop feels full, then duplicate for seamless scroll
  let padded = [...projects]
  while (padded.length < 5) {
    padded = [...padded, ...projects]
  }
  const loopItems = [...padded, ...padded]

  return (
    <section className={styles.section}>
      {/* Header — inside container */}
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easing.outExpo }}
        >
          <div>
            <span className={styles.eyebrow}>Real Installations</span>
            <h2 className={styles.title}>From Our Portfolio</h2>
            <p className={styles.subtitle}>Stone art installed across homes &amp; commercial spaces</p>
          </div>
          <Link href="/projects" className={styles.viewAll}>
            View all projects
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>

      {/* Full-width scroll track — outside container so it bleeds edge to edge */}
      <div className={styles.trackOuter}>
        <div className={styles.track}>
          {loopItems.map((project, index) => {
            const id = project._id || project.id
            const img = project.afterImage || project.beforeImage
            return (
              <Link
                key={`${id}-${index}`}
                href={`/projects?open=${id}`}
                className={styles.card}
              >
                <div className={styles.imageWrap}>
                  {img && (
                    <img
                      src={img}
                      alt={project.name}
                      className={styles.image}
                      loading="lazy"
                    />
                  )}
                  <div className={styles.overlay}>
                    {project.category && (
                      <span className={styles.badge}>{project.category}</span>
                    )}
                  </div>
                </div>
                <div className={styles.info}>
                  <p className={styles.name}>{project.name}</p>
                  {project.location && (
                    <p className={styles.location}>
                      <MapPin size={12} />
                      {project.location}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Hover hint — pure CSS visibility toggle */}
        <div className={styles.hoverHint} aria-hidden="true">
          Hover to explore
        </div>
      </div>

      {/* CTA — back inside container */}
      <div className="container">
        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/projects" className={styles.ctaLink}>
            Explore full portfolio
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
