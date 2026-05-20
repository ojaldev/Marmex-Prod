'use client'

import { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Input = forwardRef(function Input(
  {
    label,
    error,
    helper,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-[var(--color-obsidian)] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error
              ? 'border-[var(--color-ruby)] focus:border-[var(--color-ruby)] focus:shadow-[0_0_0_4px_rgba(139,30,63,0.1)]'
              : 'border-[var(--color-platinum)] focus:border-[var(--color-gold-24k)] focus:shadow-[0_0_0_4px_rgba(212,165,116,0.1)]'
            }
            bg-white text-[var(--color-obsidian)] placeholder-[var(--color-text-muted)]
            ${className}
          `}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <Icon
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1.5 text-sm text-[var(--color-ruby)] font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {helper && !error && (
        <p className="mt-1.5 text-sm text-[var(--color-text-gray)]">{helper}</p>
      )}
    </div>
  )
})

export default Input
