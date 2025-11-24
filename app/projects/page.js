'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { MapPin, Play } from 'lucide-react'
import styles from './projects.module.css'

export default function ProjectsPage() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                // Handle MongoDB API format {projects: [], pagination: {}}
                const projectList = data.projects || data
                setProjects(projectList)
            })
            .catch(err => console.error('Failed to load projects:', err))
            .finally(() => setLoading(false))
    }, [])

    return (
        <>
            <Header />
            <main className={styles.projectsPage}>
                <div className={styles.hero}>
                    <div className="container">
                        <h1>Our Portfolio</h1>
                        <p>Showcasing our finest stone art installations and projects</p>
                    </div>
                </div>

                <div className="container section">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className={styles.empty}>
                            <h3>No projects yet</h3>
                            <p>Check back soon to see our latest installations and showcases</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {projects.map(project => (
                                <div key={project._id || project.id} className={styles.projectCard}>
                                    <div className={styles.images}>
                                        {project.beforeImage && project.afterImage ? (
                                            <div className={styles.beforeAfter}>
                                                <div className={styles.imageHalf}>
                                                    <div
                                                        className={styles.image}
                                                        style={{ backgroundImage: `url(${project.beforeImage})` }}
                                                    />
                                                    <span className={styles.label}>Before</span>
                                                </div>
                                                <div className={styles.imageHalf}>
                                                    <div
                                                        className={styles.image}
                                                        style={{ backgroundImage: `url(${project.afterImage})` }}
                                                    />
                                                    <span className={styles.label}>After</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={styles.singleImage}
                                                style={{ backgroundImage: `url(${project.beforeImage || project.afterImage})` }}
                                            />
                                        )}
                                        {project.installationVideo && (
                                            <div className={styles.videoIcon}>
                                                <Play size={24} />
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.content}>
                                        <h3>{project.name}</h3>
                                        {project.location && (
                                            <p className={styles.location}>
                                                <MapPin size={16} />
                                                {project.location}
                                            </p>
                                        )}
                                        <p className={styles.description}>{project.description}</p>

                                        {project.clientTestimonial && (
                                            <blockquote className={styles.testimonial}>
                                                &quot;{project.clientTestimonial}&quot;
                                            </blockquote>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}
