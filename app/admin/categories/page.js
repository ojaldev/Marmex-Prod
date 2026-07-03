'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Upload, X, GripVertical } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'
import styles from './categories.module.css'

export default function AdminCategoriesPage() {
    const notification = useNotification()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: '',
        order: 0,
        active: true
    })
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories')
            const data = await res.json()
            setCategories(data || [])
        } catch (error) {
            console.error('Failed to fetch categories:', error)
            notification.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const url = editingCategory
                ? `/api/categories/${editingCategory._id}`
                : '/api/categories'
            const method = editingCategory ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                notification.success(editingCategory ? 'Category updated!' : 'Category created!')
                setShowModal(false)
                resetForm()
                fetchCategories()
            } else {
                const data = await res.json()
                notification.error(data.error || 'Failed to save category')
            }
        } catch (error) {
            notification.error('Failed to save category')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
            if (res.ok) {
                notification.success('Category deleted!')
                fetchCategories()
            } else {
                const data = await res.json().catch(() => ({}))
                notification.error(data.error || 'Failed to delete category')
            }
        } catch (error) {
            notification.error('Failed to delete category')
        }
    }

    const handleEdit = (category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            image: category.image || '',
            order: category.order || 0,
            active: category.active !== false
        })
        setShowModal(true)
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        const reader = new FileReader()
        reader.onloadend = async () => {
            try {
                const res = await fetch('/api/upload-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: reader.result,
                        folder: 'marmex/categories'
                    })
                })
                const data = await res.json()
                if (res.ok) {
                    setFormData(prev => ({ ...prev, image: data.url }))
                    notification.success('Image uploaded!')
                } else {
                    notification.error('Failed to upload image')
                }
            } catch (error) {
                notification.error('Failed to upload image')
            } finally {
                setUploading(false)
            }
        }
        reader.readAsDataURL(file)
    }

    const resetForm = () => {
        setEditingCategory(null)
        setFormData({
            name: '',
            slug: '',
            description: '',
            image: '',
            order: 0,
            active: true
        })
    }

    const generateSlug = (name) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    if (loading) {
        return <div className={styles.loading}>Loading categories...</div>
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Categories</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true) }}
                >
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div className={styles.grid}>
                {categories.map((category) => (
                    <div key={category._id} className={styles.card}>
                        <div
                            className={styles.cardImage}
                            style={{ backgroundImage: category.image ? `url(${category.image})` : 'none' }}
                        >
                            {!category.image && <span>No Image</span>}
                        </div>
                        <div className={styles.cardBody}>
                            <h3>{category.name}</h3>
                            <p className={styles.slug}>/{category.slug}</p>
                            <p className={styles.description}>{category.description}</p>
                            <div className={styles.meta}>
                                <span className={`${styles.status} ${category.active ? styles.active : styles.inactive}`}>
                                    {category.active ? 'Active' : 'Inactive'}
                                </span>
                                <span className={styles.order}>Order: {category.order}</span>
                            </div>
                        </div>
                        <div className={styles.cardActions}>
                            <button onClick={() => handleEdit(category)} className={styles.editBtn}>
                                <Edit2 size={16} /> Edit
                            </button>
                            <button onClick={() => handleDelete(category._id)} className={styles.deleteBtn}>
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className={styles.empty}>
                    <p>No categories yet. Add your first category!</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                            <button onClick={() => setShowModal(false)} className={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const name = e.target.value
                                        setFormData(prev => ({
                                            ...prev,
                                            name,
                                            slug: prev.slug || generateSlug(name)
                                        }))
                                    }}
                                    required
                                    placeholder="e.g., Stone Sculptures"
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Slug *</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    required
                                    placeholder="e.g., stone-sculptures"
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows="3"
                                    placeholder="Brief description of this category"
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Category Image</label>
                                <div className={styles.imageUpload}>
                                    {formData.image ? (
                                        <div className={styles.imagePreview}>
                                            <img src={formData.image} alt="Category" />
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className={styles.uploadLabel}>
                                            <Upload size={24} />
                                            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                                hidden
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                        min="0"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.active}
                                            onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                        />
                                        <span>Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
