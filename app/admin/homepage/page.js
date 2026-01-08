'use client'

import { useEffect, useState } from 'react'
import { Save, Upload, X, Image as ImageIcon } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'
import styles from '../products/product-editor.module.css'

export default function HomepagePage() {
    const notification = useNotification()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingHero, setUploadingHero] = useState(false)
    const [uploadingStory, setUploadingStory] = useState(false)
    const [config, setConfig] = useState({
        hero: {
            title: '',
            subtitle: '',
            image: '',
            cta: {
                primary: '',
                secondary: ''
            }
        },
        brandStory: {
            title: '',
            content: '',
            image: ''
        },
        featuredVideo: {
            title: '',
            youtubeUrl: ''
        }
    })

    useEffect(() => {
        loadConfig()
    }, [])

    const loadConfig = async () => {
        try {
            const res = await fetch('/api/site-config')
            const data = await res.json()
            setConfig(data)
        } catch (error) {
            console.error('Failed to load config:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (file, type) => {
        if (!file) return

        const setUploading = type === 'hero' ? setUploadingHero : setUploadingStory

        setUploading(true)
        const reader = new FileReader()

        reader.onloadend = async () => {
            try {
                const res = await fetch('/api/upload-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: reader.result,
                        folder: 'marmex/homepage'
                    })
                })
                const data = await res.json()

                if (res.ok) {
                    if (type === 'hero') {
                        setConfig(prev => ({ ...prev, hero: { ...prev.hero, image: data.url } }))
                    } else {
                        setConfig(prev => ({ ...prev, brandStory: { ...prev.brandStory, image: data.url } }))
                    }
                    notification.success('Image uploaded!')
                } else {
                    notification.error(data.error || 'Failed to upload image')
                }
            } catch (error) {
                console.error('Upload error:', error)
                notification.error('Failed to upload image')
            } finally {
                setUploading(false)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/site-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })

            if (res.ok) {
                notification.success('Homepage updated successfully!')
            } else {
                notification.error('Failed to save changes')
            }
        } catch (error) {
            console.error('Failed to save config:', error)
            notification.error('Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div style={{ padding: 'var(--spacing-lg)' }}>Loading...</div>
    }

    return (
        <div>
            <div className={styles.header}>
                <h1>Homepage Content</h1>
                <p>Manage hero banner, brand story, and featured content</p>
            </div>

            <form onSubmit={handleSave}>
                <div className={styles.section}>
                    <h2>Hero Banner</h2>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Hero Title *</label>
                            <input
                                type="text"
                                required
                                value={config.hero.title}
                                onChange={e => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
                                placeholder="Luxury Marble & Stone Art"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Hero Subtitle *</label>
                            <input
                                type="text"
                                required
                                value={config.hero.subtitle}
                                onChange={e => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                                placeholder="Handcrafted Perfection for Your Space"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label><ImageIcon size={16} /> Hero Image</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            {config.hero.image ? (
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={config.hero.image}
                                        alt="Hero"
                                        style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setConfig({ ...config, hero: { ...config.hero, image: '' } })}
                                        style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: '#e53935',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '200px',
                                    height: '120px',
                                    border: '2px dashed #ccc',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: '#f9f9f9'
                                }}>
                                    <Upload size={24} style={{ marginBottom: '8px', color: '#888' }} />
                                    <span style={{ fontSize: '14px', color: '#888' }}>
                                        {uploadingHero ? 'Uploading...' : 'Upload Image'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        disabled={uploadingHero}
                                        onChange={(e) => handleImageUpload(e.target.files[0], 'hero')}
                                    />
                                </label>
                            )}
                        </div>
                        <small style={{ color: 'var(--color-text-gray)', marginTop: '8px', display: 'block' }}>
                            Recommended size: 1920x800px
                        </small>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Primary Button Text</label>
                            <input
                                type="text"
                                value={config.hero.cta.primary}
                                onChange={e => setConfig({ ...config, hero: { ...config.hero, cta: { ...config.hero.cta, primary: e.target.value } } })}
                                placeholder="Explore Collection"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Secondary Button Text</label>
                            <input
                                type="text"
                                value={config.hero.cta.secondary}
                                onChange={e => setConfig({ ...config, hero: { ...config.hero, cta: { ...config.hero.cta, secondary: e.target.value } } })}
                                placeholder="Custom Orders"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2>Brand Story Section</h2>
                    <div className={styles.field}>
                        <label>Section Title *</label>
                        <input
                            type="text"
                            required
                            value={config.brandStory.title}
                            onChange={e => setConfig({ ...config, brandStory: { ...config.brandStory, title: e.target.value } })}
                            placeholder="Craftsmanship Meets Artistry"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Story Content *</label>
                        <textarea
                            required
                            rows="4"
                            value={config.brandStory.content}
                            onChange={e => setConfig({ ...config, brandStory: { ...config.brandStory, content: e.target.value } })}
                            placeholder="Tell your brand story..."
                        />
                    </div>

                    <div className={styles.field}>
                        <label><ImageIcon size={16} /> Story Image</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            {config.brandStory.image ? (
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={config.brandStory.image}
                                        alt="Brand Story"
                                        style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setConfig({ ...config, brandStory: { ...config.brandStory, image: '' } })}
                                        style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: '#e53935',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '200px',
                                    height: '120px',
                                    border: '2px dashed #ccc',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: '#f9f9f9'
                                }}>
                                    <Upload size={24} style={{ marginBottom: '8px', color: '#888' }} />
                                    <span style={{ fontSize: '14px', color: '#888' }}>
                                        {uploadingStory ? 'Uploading...' : 'Upload Image'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        disabled={uploadingStory}
                                        onChange={(e) => handleImageUpload(e.target.files[0], 'story')}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2>Featured Video</h2>
                    <div className={styles.field}>
                        <label>Video Section Title</label>
                        <input
                            type="text"
                            value={config.featuredVideo.title}
                            onChange={e => setConfig({ ...config, featuredVideo: { ...config.featuredVideo, title: e.target.value } })}
                            placeholder="Watch Our Craftsmen at Work"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>YouTube Video URL</label>
                        <input
                            type="url"
                            value={config.featuredVideo.youtubeUrl}
                            onChange={e => setConfig({ ...config, featuredVideo: { ...config.featuredVideo, youtubeUrl: e.target.value } })}
                            placeholder="https://www.youtube.com/embed/..."
                        />
                        <small style={{ color: 'var(--color-text-gray)' }}>Use the embed URL, not the regular watch URL</small>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="submit" disabled={saving} className="btn btn-primary">
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}

