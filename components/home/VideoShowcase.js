'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import styles from './VideoShowcase.module.css'

export default function VideoShowcase() {
    const [config, setConfig] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        fetch('/api/site-config')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error('Failed to load config:', err))
    }, [])

    if (!config || !config.featuredVideo) return null

    const videoId = extractYouTubeId(config.featuredVideo.youtubeUrl)

    return (
        <section className={`section ${styles.videoSection}`}>
            <div className="container">
                <motion.h2
                    className="section-title"
                    style={{ color: 'white' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {config.featuredVideo.title}
                </motion.h2>

                <motion.div
                    className={styles.videoWrapper}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    {!isPlaying ? (
                        <div
                            className={styles.thumbnail}
                            onClick={() => setIsPlaying(true)}
                            style={{
                                backgroundImage: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`,
                            }}
                        >
                            <div className={styles.thumbnailOverlay} />
                            <motion.button
                                className={styles.playButton}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Play size={32} fill="white" />
                            </motion.button>
                        </div>
                    ) : (
                        <iframe
                            className={styles.video}
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    )}
                </motion.div>
            </div>
        </section>
    )
}

function extractYouTubeId(url) {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : ''
}
