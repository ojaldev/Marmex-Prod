'use client'

import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import styles from './VideoShowcase.module.css'

export default function VideoShowcase() {
    const [config, setConfig] = useState(null)

    useEffect(() => {
        fetch('/api/site-config')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error('Failed to load config:', err))
    }, [])

    if (!config || !config.featuredVideo) return null

    return (
        <section className={`section ${styles.videoSection}`}>
            <div className="container">
                <h2 className="section-title" style={{ color: 'white' }}>{config.featuredVideo.title}</h2>

                <div className={styles.videoWrapper}>
                    <iframe
                        className={styles.video}
                        src={config.featuredVideo.youtubeUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </section>
    )
}
