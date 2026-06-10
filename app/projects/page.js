'use client'

import { useEffect, useState, useMemo, useRef, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Star, Grid3X3, LayoutGrid, Home, Building2 } from 'lucide-react'
import ProjectCard from '@/components/projects/ProjectCard'

const ProjectDetailModal = dynamic(() => import('@/components/projects/ProjectDetailModal'), { ssr: false })
import { fadeInUp, staggerContainer, easing } from '@/lib/animations'
import styles from './projects.module.css'

function ProjectsContent() {
  const searchParams = useSearchParams()
  const openId = searchParams.get('open')

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [gridColumns, setGridColumns] = useState(2)
  const [selectedProject, setSelectedProject] = useState(null)
  const openHandled = useRef(false)

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        const projectList = data.projects || data
        setProjects(projectList)

        // Handle ?open= param — auto-open a project modal
        if (openId && !openHandled.current) {
          const match = projectList.find(p => (p._id || p.id) === openId)
          if (match) {
            setSelectedProject(match)
            openHandled.current = true
          }
        }
      })
      .catch(err => console.error('Failed to load projects:', err))
      .finally(() => setLoading(false))
  }, [openId])

  // Counts per type — category field stores "Residential" / "Commercial" etc.
  const residentialCount = useMemo(() => projects.filter(p => p.category?.toLowerCase() === 'residential').length, [projects])
  const commercialCount = useMemo(() => projects.filter(p => p.category?.toLowerCase() === 'commercial').length, [projects])

  // Filter projects
  const filteredProjects = useMemo(() => {
    let result = [...projects]

    if (selectedType !== 'all') {
      result = result.filter(p => p.category?.toLowerCase() === selectedType)
    }

    if (showFeaturedOnly) {
      result = result.filter(p => p.featured)
    }

    result.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      const dateA = a.completionDate ? new Date(a.completionDate) : new Date(0)
      const dateB = b.completionDate ? new Date(b.completionDate) : new Date(0)
      return dateB - dateA
    })

    return result
  }, [projects, selectedType, showFeaturedOnly])

  const featuredCount = projects.filter(p => p.featured).length

  return (
    <main className={styles.projectsPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easing.outExpo }}
          >
            <h1 className={styles.heroTitle}>Our Portfolio</h1>
            <motion.div
              className={styles.heroDivider}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: easing.elegant }}
            />
            <p className={styles.heroSubtitle}>
              Showcasing our finest stone art installations and completed works
            </p>
          </motion.div>

          {/* Stats */}
          {!loading && (
            <motion.div
              className={styles.stats}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className={styles.statItem}>
                <span className={styles.statValue}>{projects.length}</span>
                <span className={styles.statLabel}>Projects</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statValue}>{residentialCount}</span>
                <span className={styles.statLabel}>Residential</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statValue}>{commercialCount}</span>
                <span className={styles.statLabel}>Commercial</span>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Toolbar */}
      <div className="container">
        <motion.div
          className={styles.toolbar}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: easing.elegant }}
        >
          {/* Primary type toggle */}
          <div className={styles.typeToggle}>
            {[
              { key: 'all', label: 'All', count: projects.length },
              { key: 'residential', label: 'Residential', count: residentialCount, Icon: Home },
              { key: 'commercial', label: 'Commercial', count: commercialCount, Icon: Building2 },
            ].map(({ key, label, count, Icon }) => (
              <button
                key={key}
                className={`${styles.typeBtn} ${selectedType === key ? styles.typeBtnActive : ''}`}
                onClick={() => setSelectedType(key)}
              >
                {Icon && <Icon size={14} />}
                {label}
                <span className={styles.typeBtnCount}>{count}</span>
              </button>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className={styles.controls}>
            {featuredCount > 0 && (
              <button
                className={`${styles.featuredToggle} ${showFeaturedOnly ? styles.featuredToggleActive : ''}`}
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              >
                <Star size={14} fill={showFeaturedOnly ? 'currentColor' : 'none'} />
                Featured
              </button>
            )}

            <div className={styles.gridToggle}>
              <button
                className={`${styles.gridBtn} ${gridColumns === 2 ? styles.gridBtnActive : ''}`}
                onClick={() => setGridColumns(2)}
                title="2 columns"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`${styles.gridBtn} ${gridColumns === 3 ? styles.gridBtnActive : ''}`}
                onClick={() => setGridColumns(3)}
                title="3 columns"
              >
                <Grid3X3 size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.p
          className={styles.resultsCount}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Showing <strong>{filteredProjects.length}</strong> of {projects.length} projects
        </motion.p>

        {/* Projects Grid */}
        {loading ? (
          <div className={styles.loadingGrid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonLine} style={{ width: '70%' }} />
                  <div className={styles.skeletonLine} style={{ width: '40%' }} />
                  <div className={styles.skeletonLine} style={{ width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            className={styles.empty}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FileText size={64} className={styles.emptyIcon} />
            <h3>No projects found</h3>
            <p>Try adjusting your filters or check back soon for new showcases</p>
          </motion.div>
        ) : (
          <motion.div
            className={styles.grid}
            style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id || project.id}
                  layout
                  variants={fadeInUp}
                >
                  <ProjectCard
                    project={project}
                    index={index}
                    onViewDetails={setSelectedProject}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsContent />
    </Suspense>
  )
}
