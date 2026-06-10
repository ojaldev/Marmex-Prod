'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X, Search } from 'lucide-react'
import styles from '../../products/product-editor.module.css'

export default function NewProjectPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(null)
    const [allProducts, setAllProducts] = useState([])
    const [productSearch, setProductSearch] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        category: '',
        projectType: 'residential',
        description: '',
        location: '',
        materials: '',
        dimensions: '',
        beforeImage: '',
        afterImage: '',
        installationVideo: '',
        clientTestimonial: '',
        testimonialVideo: '',
        completionDate: '',
        featured: false,
        relatedProducts: []
    })

    useEffect(() => {
        fetch('/api/products')
            .then(r => r.json())
            .then(d => setAllProducts(d.products || d || []))
            .catch(() => {})
    }, [])

    const uploadToCloudinary = async (file, folder = 'marmex/projects') => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = async () => {
                try {
                    const res = await fetch('/api/upload-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image: reader.result,
                            folder
                        })
                    })

                    const data = await res.json()
                    if (res.ok) {
                        resolve(data.url)
                    } else {
                        reject(new Error(data.error || 'Upload failed'))
                    }
                } catch (error) {
                    reject(error)
                }
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const handleImageUpload = async (e, imageType) => {
        const file = e.target.files[0]
        if (!file) return

        setUploadingImage(imageType)
        try {
            const url = await uploadToCloudinary(file)
            setFormData(prev => ({
                ...prev,
                [imageType]: url
            }))
        } catch (error) {
            console.error('Upload error:', error)
            alert('Image upload failed')
        } finally {
            setUploadingImage(null)
        }
    }

    const removeImage = (imageType) => {
        setFormData(prev => ({
            ...prev,
            [imageType]: ''
        }))
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push('/admin/projects')
            } else {
                alert('Failed to create project')
            }
        } catch (error) {
            console.error('Error creating project:', error)
            alert('Failed to create project')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.editorPage}>
            <div className={styles.header}>
                <Link href="/admin/projects" className={styles.backBtn}>
                    <ArrowLeft size={20} />
                    Back to Projects
                </Link>
                <h1>Add New Project</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Basic Information */}
                <section className={styles.section}>
                    <h2>Project Information</h2>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Project Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Luxury Villa Stone Installation"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Client Name</label>
                            <input
                                type="text"
                                name="client"
                                value={formData.client}
                                onChange={handleChange}
                                placeholder="ABC Corporation"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="">Select Category</option>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Hospitality">Hospitality</option>
                                <option value="Religious">Religious</option>
                                <option value="Public Spaces">Public Spaces</option>
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Mumbai, India"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Describe the project, challenges, and solutions..."
                            required
                        />
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Materials Used</label>
                            <input
                                type="text"
                                name="materials"
                                value={formData.materials}
                                onChange={handleChange}
                                placeholder="Italian Marble, Granite"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Dimensions</label>
                            <input
                                type="text"
                                name="dimensions"
                                value={formData.dimensions}
                                onChange={handleChange}
                                placeholder="500 sq ft"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Completion Date</label>
                            <input
                                type="date"
                                name="completionDate"
                                value={formData.completionDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </section>

                {/* Images */}
                <section className={styles.section}>
                    <h2>Project Images</h2>

                    {/* Before Image */}
                    <div className={styles.field}>
                        <label>Before Image</label>
                        {formData.beforeImage ? (
                            <div className={styles.imageUploadArea}>
                                <div className={styles.uploadedImage}>
                                    <img src={formData.beforeImage} alt="Before" />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={() => removeImage('beforeImage')}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.imageUploadArea}>
                                <label className={styles.uploadLabel}>
                                    <Upload size={32} />
                                    <span>Upload Before Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'beforeImage')}
                                        style={{ display: 'none' }}
                                        disabled={uploadingImage === 'beforeImage'}
                                    />
                                </label>
                                {uploadingImage === 'beforeImage' && <p>Uploading...</p>}
                            </div>
                        )}
                    </div>

                    {/* After Image */}
                    <div className={styles.field}>
                        <label>After Image *</label>
                        {formData.afterImage ? (
                            <div className={styles.imageUploadArea}>
                                <div className={styles.uploadedImage}>
                                    <img src={formData.afterImage} alt="After" />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={() => removeImage('afterImage')}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.imageUploadArea}>
                                <label className={styles.uploadLabel}>
                                    <Upload size={32} />
                                    <span>Upload After Image</span>
                                    <p>Required - shows completed project</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'afterImage')}
                                        style={{ display: 'none' }}
                                        disabled={uploadingImage === 'afterImage'}
                                    />
                                </label>
                                {uploadingImage === 'afterImage' && <p>Uploading...</p>}
                            </div>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label>Installation Video URL (YouTube)</label>
                        <input
                            type="url"
                            name="installationVideo"
                            value={formData.installationVideo}
                            onChange={handleChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                </section>

                {/* Client Feedback */}
                <section className={styles.section}>
                    <h2>Client Feedback</h2>

                    <div className={styles.field}>
                        <label>Client Testimonial</label>
                        <textarea
                            name="clientTestimonial"
                            value={formData.clientTestimonial}
                            onChange={handleChange}
                            rows="3"
                            placeholder="What did the client say about this project..."
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Testimonial Video URL</label>
                        <input
                            type="url"
                            name="testimonialVideo"
                            value={formData.testimonialVideo}
                            onChange={handleChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                </section>

                {/* Options */}
                <section className={styles.section}>
                    <h2>Options</h2>
                    <div className={styles.field}>
                        <label>Project Type</label>
                        <div className={styles.radioGroup}>
                            {['residential', 'commercial'].map(type => (
                                <label key={type} className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="projectType"
                                        value={type}
                                        checked={formData.projectType === type}
                                        onChange={handleChange}
                                    />
                                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                            />
                            <span>Feature this project on homepage</span>
                        </label>
                    </div>
                </section>

                {/* Linked Products */}
                <section className={styles.section}>
                    <h2>Linked Products</h2>
                    <p style={{ color: 'var(--color-text-gray)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
                        Link products used in this project to enable "Shop this look"
                    </p>
                    <div className={styles.field}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-gray)', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                placeholder="Search products to link..."
                                style={{ paddingLeft: '36px', width: '100%' }}
                            />
                        </div>
                        {productSearch && (
                            <div style={{ border: '1px solid var(--color-platinum)', borderRadius: 'var(--radius-md)', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', background: 'var(--color-surface)' }}>
                                {allProducts
                                    .filter(p => p.name?.toLowerCase().includes(productSearch.toLowerCase()) && !formData.relatedProducts.includes(p._id || p.id))
                                    .slice(0, 8)
                                    .map(p => (
                                        <button
                                            key={p._id || p.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, relatedProducts: [...prev.relatedProducts, p._id || p.id] }))
                                                setProductSearch('')
                                            }}
                                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--color-platinum)' }}
                                        >
                                            {p.name} <span style={{ color: 'var(--color-text-gray)' }}>· {p.category}</span>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                    {formData.relatedProducts.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            {formData.relatedProducts.map(id => {
                                const p = allProducts.find(pr => (pr._id || pr.id) === id)
                                return (
                                    <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--color-pearl)', border: '1px solid var(--color-platinum)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)' }}>
                                        {p?.name || id}
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, relatedProducts: prev.relatedProducts.filter(rid => rid !== id) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-gray)', lineHeight: 1 }}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* Actions */}
                <div className={styles.actions}>
                    <Link href="/admin/projects" className="btn btn-outline">
                        Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={loading || uploadingImage}>
                        <Save size={18} />
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    )
}
