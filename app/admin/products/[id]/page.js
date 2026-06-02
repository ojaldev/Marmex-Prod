'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Upload, X, Video, Play } from 'lucide-react'
import styles from '../product-editor.module.css'
import { parseDimensions, parseWeight, validateDimensions, validateWeight, formatDimensions, formatWeight } from '@/lib/product-specs'

export default function EditProductPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(null)
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        shortDescription: '',
        detailedDescription: '',
        material: '',
        color: '',
        dimensions: { length: '', width: '', height: '', unit: 'inch' },
        weight: { value: '', unit: 'kg' },
        price: '',
        discount: 0,
        stock: 'In Stock',
        customizationAvailable: false,
        customizationInstructions: '',
        mainImage: '',
        additionalImages: [],
        lifestyleImages: [],
        packagingImages: [],
        videoThumbnail: '',
        videoUrl: '',
        instagramReel: '',
        videos: [],
        metaTitle: '',
        metaDescription: '',
        tags: '',
        highlight: '',
        giftReady: false,
        exportGrade: false
    })
    const [specErrors, setSpecErrors] = useState({})

    useEffect(() => {
        loadData()
    }, [params.id])

    const loadData = async () => {
        try {
            const [productRes, categoriesRes] = await Promise.all([
                fetch(`/api/products/${params.id}`),
                fetch('/api/categories')
            ])

            const product = await productRes.json()
            const cats = await categoriesRes.json()

            setCategories(cats)
            const parsedDims = parseDimensions(product.dimensions)
            const parsedWeight = parseWeight(product.weight)

            setFormData({
                ...product,
                dimensions: parsedDims || { length: '', width: '', height: '', unit: 'inch' },
                weight: parsedWeight || { value: '', unit: 'kg' },
                additionalImages: product.additionalImages || [],
                lifestyleImages: product.lifestyleImages || [],
                packagingImages: product.packagingImages || [],
                videos: product.videos || [],
                tags: (product.tags || []).join(', '),
                discount: product.discount || 0
            })
        } catch (error) {
            console.error('Failed to load product:', error)
            alert('Failed to load product')
        } finally {
            setLoading(false)
        }
    }

    const uploadToCloudinary = async (file, folder = 'marmex/products', type = 'image') => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = async () => {
                try {
                    const res = await fetch('/api/upload-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            file: reader.result,
                            folder,
                            type
                        })
                    })

                    const data = await res.json()
                    if (res.ok) {
                        resolve({ url: data.url, publicId: data.publicId })
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
            const result = await uploadToCloudinary(file)

            if (imageType === 'mainImage' || imageType === 'videoThumbnail') {
                setFormData(prev => ({
                    ...prev,
                    [imageType]: result.url
                }))
            } else {
                setFormData(prev => ({
                    ...prev,
                    [imageType]: [...prev[imageType], result.url]
                }))
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Image upload failed')
        } finally {
            setUploadingImage(null)
        }
    }

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file (MP4, WebM, MOV)')
            return
        }

        if (file.size > 100 * 1024 * 1024) {
            alert('Video file size must be less than 100MB')
            return
        }

        setUploadingVideo(true)
        try {
            const result = await uploadToCloudinary(file, 'marmex/products/videos', 'video')
            setFormData(prev => ({
                ...prev,
                videos: [...prev.videos, {
                    url: result.url,
                    publicId: result.publicId,
                    title: '',
                    order: prev.videos.length
                }]
            }))
        } catch (error) {
            console.error('Video upload error:', error)
            alert(`Failed to upload video: ${error.message}`)
        } finally {
            setUploadingVideo(false)
        }
    }

    const removeVideo = (index) => {
        setFormData(prev => ({
            ...prev,
            videos: prev.videos.filter((_, i) => i !== index)
        }))
    }

    const updateVideoTitle = (index, title) => {
        setFormData(prev => ({
            ...prev,
            videos: prev.videos.map((v, i) => i === index ? { ...v, title } : v)
        }))
    }

    const removeImage = (imageType, index = null) => {
        if (index === null) {
            setFormData(prev => ({
                ...prev,
                [imageType]: ''
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [imageType]: prev[imageType].filter((_, i) => i !== index)
            }))
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSpecChange = (group, field, value) => {
        setFormData(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [field]: value
            }
        }))
        // Clear error for this group when user starts typing
        setSpecErrors(prev => {
            if (!prev[group]) return prev
            const next = { ...prev }
            delete next[group]
            return next
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setSpecErrors({})

        // Validate specs
        const dimValidation = validateDimensions(formData.dimensions)
        const weightValidation = validateWeight(formData.weight)
        const errors = {}
        if (!dimValidation.valid) errors.dimensions = dimValidation.error
        if (!weightValidation.valid) errors.weight = weightValidation.error

        if (Object.keys(errors).length > 0) {
            setSpecErrors(errors)
            setSaving(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        try {
            const productData = {
                ...formData,
                dimensions: formatDimensions(formData.dimensions),
                weight: formatWeight(formData.weight),
                price: parseFloat(formData.price),
                discount: parseFloat(formData.discount) || 0,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            }

            const res = await fetch(`/api/products/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            })

            if (res.ok) {
                alert('Product updated successfully!')
                router.push('/admin/products')
            } else {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update product')
            }
        } catch (error) {
            console.error('Save error:', error)
            alert(error.message || 'Failed to update product')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            const res = await fetch(`/api/products/${params.id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                alert('Product deleted successfully!')
                router.push('/admin/products')
            } else {
                throw new Error('Failed to delete product')
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete product')
        }
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <p>Loading product...</p>
            </div>
        )
    }

    return (
        <div className={styles.editorPage}>
            <div className={styles.header}>
                <Link href="/admin/products" className={styles.backBtn}>
                    <ArrowLeft size={20} />
                    Back to Products
                </Link>
                <h1>Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Basic Information */}
                <section className={styles.section}>
                    <h2>Basic Information</h2>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Short Description *</label>
                        <textarea
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            rows="3"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Detailed Description</label>
                        <textarea
                            name="detailedDescription"
                            value={formData.detailedDescription}
                            onChange={handleChange}
                            rows="6"
                        />
                    </div>
                </section>

                {/* Product Details */}
                <section className={styles.section}>
                    <h2>Product Details</h2>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Material</label>
                            <input
                                type="text"
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Color</label>
                            <input
                                type="text"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    {/* Physical Specs — full width row for better UX */}
                    <div className={styles.specsRow}>
                        <div className={styles.field}>
                            <label>Dimensions (L × W × H)</label>
                            <div className={styles.specGroup}>
                                <div className={styles.specInputWrap}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.dimensions.length}
                                        onChange={(e) => handleSpecChange('dimensions', 'length', e.target.value)}
                                        placeholder="Length"
                                        className={specErrors.dimensions ? styles.inputError : ''}
                                    />
                                    <span className={styles.specHint}>L</span>
                                </div>
                                <div className={styles.specInputWrap}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.dimensions.width}
                                        onChange={(e) => handleSpecChange('dimensions', 'width', e.target.value)}
                                        placeholder="Width"
                                        className={specErrors.dimensions ? styles.inputError : ''}
                                    />
                                    <span className={styles.specHint}>W</span>
                                </div>
                                <div className={styles.specInputWrap}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.dimensions.height}
                                        onChange={(e) => handleSpecChange('dimensions', 'height', e.target.value)}
                                        placeholder="Height"
                                        className={specErrors.dimensions ? styles.inputError : ''}
                                    />
                                    <span className={styles.specHint}>H</span>
                                </div>
                                <select
                                    value={formData.dimensions.unit}
                                    onChange={(e) => handleSpecChange('dimensions', 'unit', e.target.value)}
                                    className={styles.specSelect}
                                >
                                    <option value="inch">inch</option>
                                    <option value="cm">cm</option>
                                </select>
                            </div>
                            {specErrors.dimensions && (
                                <span className={styles.errorText}>{specErrors.dimensions}</span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label>Weight</label>
                            <div className={styles.specGroup}>
                                <div className={styles.specInputWrap}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.weight.value}
                                        onChange={(e) => handleSpecChange('weight', 'value', e.target.value)}
                                        placeholder="e.g. 2.5"
                                        className={specErrors.weight ? styles.inputError : ''}
                                    />
                                </div>
                                <select
                                    value={formData.weight.unit}
                                    onChange={(e) => handleSpecChange('weight', 'unit', e.target.value)}
                                    className={styles.specSelect}
                                >
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                </select>
                            </div>
                            {specErrors.weight && (
                                <span className={styles.errorText}>{specErrors.weight}</span>
                            )}
                        </div>
                    </div>
                </section>

                {/* Pricing & Stock */}
                <section className={styles.section}>
                    <h2>Pricing & Stock</h2>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Price (₹) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Discount (%)</label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Stock Status *</label>
                            <select
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                            >
                                <option value="In Stock">In Stock</option>
                                <option value="Made to Order">Made to Order</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Product Images */}
                <section className={styles.section}>
                    <h2>Product Images</h2>

                    {/* Main Image */}
                    <div className={styles.field}>
                        <label>Main Image *</label>
                        {formData.mainImage ? (
                            <div className={styles.imageUploadArea}>
                                <div className={styles.uploadedImage}>
                                    <img src={formData.mainImage} alt="Main product" />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={() => removeImage('mainImage')}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.imageUploadArea}>
                                <label className={styles.uploadLabel}>
                                    <Upload size={32} />
                                    <span>Click to upload main image</span>
                                    <p>Recommended: 800x800px or higher</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'mainImage')}
                                        style={{ display: 'none' }}
                                        disabled={uploadingImage === 'mainImage'}
                                    />
                                </label>
                                {uploadingImage === 'mainImage' && <p>Uploading...</p>}
                            </div>
                        )}
                    </div>

                    {/* Additional Images */}
                    <div className={styles.field}>
                        <label>Additional Images</label>
                        <div className={styles.multiImageUpload}>
                            {formData.additionalImages.map((img, index) => (
                                <div key={index} className={styles.uploadedImage}>
                                    <img src={img} alt={`Additional ${index + 1}`} />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={() => removeImage('additionalImages', index)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <label className={styles.uploadLabel}>
                                <Upload size={24} />
                                <span>Add Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'additionalImages')}
                                    style={{ display: 'none' }}
                                    disabled={uploadingImage === 'additionalImages'}
                                />
                            </label>
                        </div>
                        {uploadingImage === 'additionalImages' && <p>Uploading...</p>}
                    </div>

                    {/* Lifestyle Images */}
                    <div className={styles.field}>
                        <label>Lifestyle Images</label>
                        <div className={styles.multiImageUpload}>
                            {formData.lifestyleImages.map((img, index) => (
                                <div key={index} className={styles.uploadedImage}>
                                    <img src={img} alt={`Lifestyle ${index + 1}`} />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={() => removeImage('lifestyleImages', index)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <label className={styles.uploadLabel}>
                                <Upload size={24} />
                                <span>Add Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'lifestyleImages')}
                                    style={{ display: 'none' }}
                                    disabled={uploadingImage === 'lifestyleImages'}
                                />
                            </label>
                        </div>
                        {uploadingImage === 'lifestyleImages' && <p>Uploading...</p>}
                    </div>

                    {/* Packaging Images */}
                    <div className={styles.field}>
                        <label>Packaging Images</label>
                        <div className={styles.multiImageUpload}>
                            {formData.packagingImages.map((img, index) => (
                                <div key={index} className={styles.uploadedImage}>
                                    <img src={img} alt={`Packaging ${index + 1}`} />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={() => removeImage('packagingImages', index)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <label className={styles.uploadLabel}>
                                <Upload size={24} />
                                <span>Add Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'packagingImages')}
                                    style={{ display: 'none' }}
                                    disabled={uploadingImage === 'packagingImages'}
                                />
                            </label>
                        </div>
                        {uploadingImage === 'packagingImages' && <p>Uploading...</p>}
                    </div>

                    {/* Product Videos — Cloudinary Upload */}
                    <div className={styles.field}>
                        <label><Video size={16} /> Product Videos (Cloudinary)</label>
                        <div className={styles.helpText}>
                            <p>📌 Upload short product showcase videos. Max 100MB per file. Supported: MP4, WebM, MOV.</p>
                        </div>
                        <label className={styles.videoUploadArea}>
                            <Upload size={28} />
                            <span>{uploadingVideo ? 'Uploading video...' : 'Click to upload video'}</span>
                            <input
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                onChange={handleVideoUpload}
                                disabled={uploadingVideo}
                                style={{ display: 'none' }}
                            />
                        </label>

                        {formData.videos.length > 0 && (
                            <div className={styles.videoGrid}>
                                {formData.videos.map((video, index) => (
                                    <div key={video.publicId || index} className={styles.videoCard}>
                                        <div className={styles.videoPreview}>
                                            <video src={video.url} preload="metadata" />
                                            <div className={styles.videoPlayOverlay}>
                                                <Play size={32} color="white" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeVideo(index)}
                                                className={styles.removeVideoBtn}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className={styles.videoInfo}>
                                            <input
                                                type="text"
                                                value={video.title}
                                                onChange={(e) => updateVideoTitle(index, e.target.value)}
                                                placeholder="Video title (optional)"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Video Thumbnail */}
                    <div className={styles.field}>
                        <label>Video Thumbnail</label>
                        {formData.videoThumbnail ? (
                            <div className={styles.imageUploadArea}>
                                <div className={styles.uploadedImage}>
                                    <img src={formData.videoThumbnail} alt="Video thumbnail" />
                                    <button
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={() => removeImage('videoThumbnail')}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.imageUploadArea}>
                                <label className={styles.uploadLabel}>
                                    <Upload size={24} />
                                    <span>Upload thumbnail</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'videoThumbnail')}
                                        style={{ display: 'none' }}
                                        disabled={uploadingImage === 'videoThumbnail'}
                                    />
                                </label>
                            </div>
                        )}
                        {uploadingImage === 'videoThumbnail' && <p>Uploading...</p>}
                    </div>

                    {/* Video URL */}
                    <div className={styles.field}>
                        <label>Video URL (YouTube Embed)</label>
                        <input
                            type="url"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            placeholder="https://www.youtube.com/embed/..."
                        />
                    </div>

                    {/* Instagram Reel */}
                    <div className={styles.field}>
                        <label>Instagram Reel URL</label>
                        <input
                            type="url"
                            name="instagramReel"
                            value={formData.instagramReel}
                            onChange={handleChange}
                            placeholder="https://www.instagram.com/reel/..."
                        />
                    </div>
                </section>

                {/* SEO & Meta */}
                <section className={styles.section}>
                    <h2>SEO & Meta</h2>
                    <div className={styles.field}>
                        <label>Meta Title</label>
                        <input
                            type="text"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleChange}
                            maxLength="60"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Meta Description</label>
                        <textarea
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            rows="3"
                            maxLength="160"
                        />
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Tags (comma-separated)</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="marble, sculpture, gift"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Highlight Badge</label>
                            <select
                                name="highlight"
                                value={formData.highlight}
                                onChange={handleChange}
                            >
                                <option value="">None</option>
                                <option value="New Arrival">New Arrival</option>
                                <option value="Featured">Featured</option>
                                <option value="Bestseller">Bestseller</option>
                                <option value="Limited Edition">Limited Edition</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Additional Options */}
                <section className={styles.section}>
                    <h2>Additional Options</h2>
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                name="customizationAvailable"
                                checked={formData.customizationAvailable}
                                onChange={handleChange}
                            />
                            <span>Customization Available</span>
                        </label>

                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                name="giftReady"
                                checked={formData.giftReady}
                                onChange={handleChange}
                            />
                            <span>Gift Ready</span>
                        </label>

                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                name="exportGrade"
                                checked={formData.exportGrade}
                                onChange={handleChange}
                            />
                            <span>Export Grade</span>
                        </label>
                    </div>

                    {formData.customizationAvailable && (
                        <div className={styles.field}>
                            <label>Customization Instructions</label>
                            <textarea
                                name="customizationInstructions"
                                value={formData.customizationInstructions}
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>
                    )}
                </section>

                {/* Actions */}
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="btn btn-outline"
                        style={{ color: '#c62828' }}
                    >
                        <Trash2 size={18} />
                        Delete Product
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link href="/admin/products" className="btn btn-outline">
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={saving || uploadingImage}>
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Update Product'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
