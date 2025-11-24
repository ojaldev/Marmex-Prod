'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, FileText, MapPin } from 'lucide-react'
import styles from '../products/products.module.css'

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadProjects()
    }, [])

    const loadProjects = async () => {
        try {
            const res = await fetch('/api/projects')
            const data = await res.json()
            // Handle MongoDB response format
            const projectList = data.projects || data
            setProjects(projectList)
        } catch (error) {
            console.error('Failed to load projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteProject = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return

        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' })
            loadProjects()
        } catch (error) {
            console.error('Failed to delete project:', error)
            alert('Failed to delete project')
        }
    }

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1>Portfolio Projects</h1>
                    <p>Showcase your installations and completed works</p>
                </div>
                <Link href="/admin/projects/new" className="btn btn-primary">
                    <Plus size={18} />
                    Add Project
                </Link>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className={styles.empty}>
                    <FileText size={64} color="var(--color-text-light)" />
                    <h3>No projects yet</h3>
                    <p>Start by adding your first portfolio project</p>
                    <Link href="/admin/projects/new" className="btn btn-primary">Add Project</Link>
                </div>
            ) : (
                <div className={styles.productsTable}>
                    <div className={styles.tableHeader}>
                        <div>Project Name</div>
                        <div>Location</div>
                        <div>Category</div>
                        <div>Featured</div>
                        <div>Actions</div>
                    </div>
                    {projects.map(project => (
                        <div key={project._id || project.id} className={styles.tableRow}>
                            <div className={styles.productName}>
                                {project.beforeImage && (
                                    <div className={styles.productThumb} style={{ backgroundImage: `url(${project.beforeImage})` }} />
                                )}
                                <span>{project.name}</span>
                            </div>
                            <div>
                                {project.location && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={14} />
                                        {project.location}
                                    </span>
                                )}
                            </div>
                            <div>{project.category || 'Uncategorized'}</div>
                            <div>
                                {project.featured && (
                                    <span className={styles.stockBadge} style={{ background: 'var(--color-secondary)', color: 'white' }}>
                                        ⭐ Featured
                                    </span>
                                )}
                            </div>
                            <div className={styles.actions}>
                                <Link href={`/admin/projects/${project._id || project.id}`} className={styles.actionBtn} title="Edit">
                                    <Edit size={16} />
                                </Link>
                                <button onClick={() => deleteProject(project._id || project.id)} className={styles.actionBtn} title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
