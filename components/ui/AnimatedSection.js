'use client'

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/animations'

export default function AnimatedSection({
  children,
  className = '',
  stagger = false,
  delay = 0,
  variant = 'fadeInUp',
  threshold = 0.15,
}) {
  const variants = {
    fadeInUp,
    fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } },
    scaleIn: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } } },
    slideInLeft: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } },
    slideInRight: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } },
  }

  const selectedVariant = variants[variant] || fadeInUp
  const containerVariant = stagger ? staggerContainer : selectedVariant

  return (
    <motion.div
      className={className}
      variants={containerVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px', amount: threshold }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedItem({
  children,
  className = '',
  variant = 'fadeInUp',
  delay = 0,
}) {
  const variants = {
    fadeInUp,
    fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } },
    scaleIn: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } } },
  }

  return (
    <motion.div
      className={className}
      variants={variants[variant] || fadeInUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
