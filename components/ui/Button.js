'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
}

const sizes = {
  small: 'btn-small',
  medium: '',
  large: 'btn-large',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'right',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  href,
  ...props
}) {
  const baseClass = `btn ${variants[variant] || variants.primary} ${sizes[size] || ''} ${fullWidth ? 'w-full' : ''} ${className}`
  const content = (
    <>
      {loading && <Loader2 size={18} className="animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={18} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={18} />}
    </>
  )

  if (href) {
    return (
      <motion.a
        href={href}
        className={baseClass}
        whileHover={!disabled ? { y: -2 } : undefined}
        whileTap={!disabled ? { y: 0 } : undefined}
        {...props}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      type={type}
      className={baseClass}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { y: -2 } : undefined}
      whileTap={!disabled && !loading ? { y: 0 } : undefined}
      {...props}
    >
      {content}
    </motion.button>
  )
}
