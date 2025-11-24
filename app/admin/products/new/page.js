'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Image as ImageIcon, Upload, X, Youtube, Instagram } from 'lucide-react'
import Link from 'next/link'
import styles from '../product-editor.module.css'

export default function NewProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        shortDescription: '',
        detailedDescription: '',
        material: '',
        color: '',
        dimensions: '',
        weight: '',
        price: '',
        discount: '',
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
        metaTitle: '',
        metaDescription: '',
        tags: '',
        highlight: '',
        giftReady: false,
        exportGrade: false,
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                discount: parseFloat(formData.discount) || 0,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
            }

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            })

            if (res.ok) {
                router.push('/admin/products')
            } else {
                alert('Failed to create product')
            }
        } catch (error) {
            console.error('Error creating product:', error)
            alert('Failed to create product')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const uploadToCloudinary = async (file, folder = 'marmex/products') => {
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

            if (imageType === 'mainImage' || imageType === 'videoThumbnail') {
                setFormData(prev => ({
                    ...prev,
                    [imageType]: url
                }))
            } else {
                // For multiple images (additional, lifestyle, packaging)
                setFormData(prev => ({
                    ...prev,
                    [imageType]: [...prev[imageType], url]
                }))
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert(`Failed to upload image: ${error.message}`)
        } finally {
            setUploadingImage(null)
        }
    }

    const removeImage = (imageType, index) => {
        if (imageType === 'mainImage' || imageType === 'videoThumbnail') {
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

    return (
        <div>
            <div className={styles.header}>
                <Link href="/admin/products" className={styles.backBtn}>
                    <ArrowLeft size={20} />
                    Back to Products
                </Link>
                <h1>Add New Product</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.section}>
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
                                placeholder="e.g., Marble Ganesha Sculpture"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Category *</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Stone Sculptures"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Material</label>
                            <input
                                type="text"
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                                placeholder="e.g., White Marble"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Color</label>
                            <input
                                type="text"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                placeholder="e.g., White, Ivory"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Dimensions (L×W×H)</label>
                            <input
                                type="text"
                                name="dimensions"
                                value={formData.dimensions}
                                onChange={handleChange}
                                placeholder="e.g., 10×8×15 cm"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Weight</label>
                            <input
                                type="text"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="e.g., 2.5 kg"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Price (₹) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
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
                                placeholder="0"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Stock Availability</label>
                            <select name="stock" value={formData.stock} onChange={handleChange}>
                                <option value="In Stock">In Stock</option>
                                <option value="Made to Order">Made to Order</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label>Highlight Badge</label>
                            <select name="highlight" value={formData.highlight} onChange={handleChange}>
                                <option value="">None</option>
                                <option value="New Arrival">New Arrival</option>
                                <option value="Featured">Featured</option>
                                <option value="Bestseller">Bestseller</option>
                                <option value="Limited Edition">Limited Edition</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Short Description</label>
                        <textarea
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            rows="2"
                            placeholder="A brief one-line description for product cards"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Detailed Description</label>
                        <textarea
                            name="detailedDescription"
                            value={formData.detailedDescription}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Full description with all product details"
                        />
                    </div>

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
                            <span>Gift-Ready Product</span>
                        </label>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                name="exportGrade"
                                checked={formData.exportGrade}
                                onChange={handleChange}
                            />
                            <span>Export Grade Quality</span>
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
                                placeholder="Explain what can be customized and any requirements"
                            />
                        </div>
                    )}
                </div>

                <div className={styles.section}>
                    <h2><ImageIcon size={20} /> Product Images - Cloudinary Upload</h2>
                    <div className={styles.helpText}>
                        <p>📌 Upload images directly - they'll be stored on Cloudinary</p>
                    </div>

                    {/* Main Image */}
                    <div className={styles.field}>
                        <label>Main Product Image *</label>
                        <div className={styles.imageUploadArea}>
                            {formData.mainImage ? (
                                <div className={styles.uploadedImage}>
                                    <img src={formData.mainImage} alt="Main product" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage('mainImage')}
                                        className={styles.removeImageBtn}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className={styles.uploadLabel}>
                                    <Upload size={32} />
                                    <span>Click to upload main image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'mainImage')}
                                        disabled={uploadingImage === 'mainImage'}
                                        hidden
                                    />
                                    {uploadingImage === 'mainImage' && <p>Uploading...</p>}
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Additional Images */}
                    <div className={styles.field}>
                        <label>Additional Product Images</label>
                        <div className={styles.multiImageUpload}>
                            {formData.additionalImages.map((url, index) => (
                                <div key={index} className={styles.uploadedImage}>
                                    <img src={url} alt={`Additional ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage('additionalImages', index)}
                                        className={styles.removeImageBtn}
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
                                    disabled={uploadingImage === 'additionalImages'}
                                    hidden
                                />
                                {uploadingImage === 'additionalImages' && <p>Uploading...</p>}
                            </label>
                        </div>
                    </div>

                    {/* Lifestyle Images */}
                    <div className={styles.field}>
                        <label>Lifestyle Images</label>
                        <div className={styles.multiImageUpload}>
                            {formData.lifestyleImages.map((url, index) => (
                                <div key={index} className={styles.uploadedImage}>
                                    <img src={url} alt={`Lifestyle ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage('lifestyleImages', index)}
                                        className={styles.removeImageBtn}
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
                                    disabled={uploadingImage === 'lifestyleImages'}
                                    hidden
                                />
                                {uploadingImage === 'lifestyleImages' && <p>Uploading...</p>}
                            </label>
                        </div>
                    </div>

                    {/* Packaging Images */}
                    <div className={styles.field}>
                        <label>Packaging Images</label>
                        <div className={styles.multiImageUpload}>
                            {formData.packagingImages.map((url, index) => (
                                <div key={index} className={styles.uploadedImage}>
                                    <img src={url} alt={`Packaging ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage('packagingImages', index)}
                                        className={styles.removeImageBtn}
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
                                    disabled={uploadingImage === 'packagingImages'}
                                    hidden
                                />
                                {uploadingImage === 'packagingImages' && <p>Uploading...</p>}
                            </label>
                        </div>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label><Youtube size={16} /> Product Video (YouTube URL)</label>
                            <input
                                type="url"
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleChange}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Video Thumbnail Image</label>
                            <div className={styles.imageUploadArea}>
                                {formData.videoThumbnail ? (
                                    <div className={styles.uploadedImage}>
                                        <img src={formData.videoThumbnail} alt="Video thumbnail" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage('videoThumbnail')}
                                            className={styles.removeImageBtn}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className={styles.uploadLabel}>
                                        <Upload size={24} />
                                        <span>Upload thumbnail</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'videoThumbnail')}
                                            disabled={uploadingImage === 'videoThumbnail'}
                                            hidden
                                        />
                                        {uploadingImage === 'videoThumbnail' && <p>Uploading...</p>}
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label><Instagram size={16} /> Instagram Reel URL</label>
                            <input
                                type="url"
                                name="instagramReel"
                                value={formData.instagramReel}
                                onChange={handleChange}
                                placeholder="https://www.instagram.com/reel/..."
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2>SEO & Marketing</h2>
                    <div className={styles.field}>
                        <label>Meta Title</label>
                        <input
                            type="text"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleChange}
                            placeholder="SEO-friendly page title"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Meta Description</label>
                        <textarea
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            rows="2"
                            placeholder="SEO description for search engines"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Tags (comma-separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="marble, ganesha, sculpture, gift, luxury"
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={() => router.back()} className="btn btn-outline">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    )
}
