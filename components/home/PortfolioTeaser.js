'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { easing, staggerContainer, fadeInUp } from '@/lib/animations'
import styles from './PortfolioTeaser.module.css'

export default function PortfolioTeaser() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => {
        const list = d.projects || d || []
        const featured = list.filter(p => p.featured).slice(0, 3)
        setProjects(featured.length >= 2 ? featured : list.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  if (projects.length === 0) return null

  return (
    <section className={styles.section}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easing.outExpo }}
        >
          <div>
            <h2 className={styles.title}>From Our Portfolio</h2>
            <p className={styles.subtitle}>Stone art installed across homes & commercial spaces</p>
          </div>
          <Link href="/projects" className={styles.viewAll}>
            View all projects
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {projects.map((project, i) => {
            const id = project._id || project.id
            const img = project.afterImage || project.beforeImage
            return (
              <motion.div key={id} variants={fadeInUp}>
                <Link href={`/projects?open=${id}`} className={`${styles.card} ${i === 0 ? styles.cardFeatured : ''}`}>
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
              </motion.div>
            )
          })}
        </motion.div>

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
