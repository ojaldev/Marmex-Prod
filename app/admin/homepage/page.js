'use client'

import { useEffect, useState } from 'react'
import { Save, Image as ImageIcon } from 'lucide-react'
import styles from '../products/product-editor.module.css'

export default function HomepagePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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
                alert('Homepage updated successfully!')
            }
        } catch (error) {
            console.error('Failed to save config:', error)
            alert('Failed to save changes')
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
                        <label><ImageIcon size={16} /> Hero Image (Google Drive URL) *</label>
                        <input
                            type="url"
                            required
                            value={config.hero.image}
                            onChange={e => setConfig({ ...config, hero: { ...config.hero, image: e.target.value } })}
                            placeholder="https://drive.google.com/file/d/..."
                        />
                        <small style={{ color: 'var(--color-text-gray)' }}>Recommended size: 1920x800px</small>
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
                        <label><ImageIcon size={16} /> Story Image (Google Drive URL) *</label>
                        <input
                            type="url"
                            required
                            value={config.brandStory.image}
                            onChange={e => setConfig({ ...config, brandStory: { ...config.brandStory, image: e.target.value } })}
                            placeholder="https://drive.google.com/file/d/..."
                        />
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
