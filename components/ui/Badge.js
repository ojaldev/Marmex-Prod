'use client'

import { motion } from 'framer-motion'

const variants = {
  highlight: {
    background: 'var(--color-gold-24k)',
    color: 'var(--color-obsidian)',
  },
  discount: {
    background: 'var(--color-ruby)',
    color: '#fff',
  },
  stock: {
    background: 'var(--color-amber)',
    color: '#fff',
  },
  success: {
    background: 'var(--color-emerald)',
    color: '#fff',
  },
  info: {
    background: 'var(--color-sapphire)',
    color: '#fff',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-gold-24k)',
    border: '1px solid var(--color-border-gold)',
  },
  ghost: {
    background: 'rgba(212, 165, 116, 0.1)',
    color: 'var(--color-gold-dark)',
  },
}

export default function Badge({
  children,
  variant = 'highlight',
  size = 'medium',
  className = '',
  animate = false,
  ...props
}) {
  const sizeClass = size === 'small' ? 'text-[10px] px-2 py-0.5' : size === 'large' ? 'text-sm px-4 py-1.5' : 'text-xs px-3 py-1'
  const style = variants[variant] || variants.highlight

  const Component = animate ? motion.span : 'span'
  const animationProps = animate ? {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring', stiffness: 500, damping: 25 },
  } : {}

  return (
    <Component
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider ${sizeClass} ${className}`}
      style={style}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  )
}
