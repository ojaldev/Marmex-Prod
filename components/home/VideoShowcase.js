'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, MessageCircle } from 'lucide-react'
import { easing } from '@/lib/animations'
import styles from './VideoShowcase.module.css'

const WHATSAPP = 'https://wa.me/919582134493?text=Hi%20Marmex%2C%20I%27d%20like%20to%20see%20your%20craft%20process.'

export default function VideoShowcase() {
    const [config, setConfig] = useState(undefined)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        fetch('/api/site-config')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(() => setConfig({}))
    }, [])

    // Still loading — render nothing to avoid layout shift
    if (config === undefined) return null

    const videoId = config.featuredVideo?.youtubeUrl
        ? extractYouTubeId(config.featuredVideo.youtubeUrl)
        : null

    const title = config.featuredVideo?.title || 'Watch Our Craftsmen at Work'

    // No video configured — show a WhatsApp CTA section instead of disappearing
    if (!videoId) {
        return (
            <section className={styles.videoSection}>
                <div className="container">
                    <motion.div
                        className={styles.fallback}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: easing.outExpo }}
                    >
                        <h2 className="section-title" style={{ color: 'white' }}>{title}</h2>
                        <p className={styles.fallbackSubtitle}>
                            Skilled artisans bring marble to life — one chisel at a time.
                            Reach out to see our craft in action.
                        </p>
                        <a
                            href={WHATSAPP}
                            className={styles.fallbackCta}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <MessageCircle size={18} />
                            See Our Process on WhatsApp
                        </a>
                    </motion.div>
                </div>
            </section>
        )
    }

    return (
        <section className={styles.videoSection}>
            <div className="container">
                <motion.h2
                    className="section-title"
                    style={{ color: 'white' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {title}
                </motion.h2>

                <motion.div
                    className={styles.videoWrapper}
                    initial={{ opacity: 0, scale: 0.96 }}
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
                                aria-label="Play video"
                            >
                                <Play size={32} fill="currentColor" />
                            </motion.button>
                        </div>
                    ) : (
                        <iframe
                            className={styles.video}
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title={title}
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
    if (!url) return null
    const match = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11})/)
    return match ? match[1] : null
}
