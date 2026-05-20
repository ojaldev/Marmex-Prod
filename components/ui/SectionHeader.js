'use client'

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/animations'

export default function SectionHeader({
  title,
  subtitle,
  align = 'center',
  decorated = true,
  className = '',
  action,
}) {
  const alignClass = {
    center: 'text-center',
    left: 'text-left',
    right: 'text-right',
  }[align] || 'text-center'

  return (
    <motion.div
      className={`mb-12 md:mb-16 ${alignClass} ${className}`}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      <motion.h2
        className="text-[var(--text-2xl)] font-[family-name:var(--font-display)] font-semibold text-[var(--color-obsidian)] mb-4"
        variants={fadeInUp}
      >
        {title}
      </motion.h2>

      {decorated && (
        <motion.div
          className="w-20 h-[3px] bg-gradient-to-r from-transparent via-[var(--color-gold-24k)] to-transparent mx-auto mb-4"
          variants={fadeInUp}
          style={align === 'left' ? { marginLeft: 0, marginRight: 'auto' } : align === 'right' ? { marginLeft: 'auto', marginRight: 0 } : {}}
        />
      )}

      {subtitle && (
        <motion.p
          className="text-[var(--color-text-gray)] text-lg max-w-2xl mx-auto"
          variants={fadeInUp}
          style={align === 'left' ? { marginLeft: 0 } : align === 'right' ? { marginRight: 0 } : {}}
        >
          {subtitle}
        </motion.p>
      )}

      {action && (
        <motion.div className="mt-6" variants={fadeInUp}>
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
