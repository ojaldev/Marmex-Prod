'use client'

import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'

export default function QuantitySelector({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  size = 'medium',
}) {
  const decrement = () => {
    if (value > min) onChange?.(value - 1)
  }

  const increment = () => {
    if (value < max) onChange?.(value + 1)
  }

  const sizeClass = size === 'small'
    ? 'h-8 w-8'
    : size === 'large'
    ? 'h-12 w-12'
    : 'h-10 w-10'

  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16

  return (
    <div className="inline-flex items-center border-2 border-[var(--color-platinum)] rounded-lg overflow-hidden bg-white">
      <motion.button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className={`${sizeClass} flex items-center justify-center text-[var(--color-obsidian)] hover:bg-[var(--color-pearl)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
        whileTap={{ scale: 0.9 }}
        aria-label="Decrease quantity"
      >
        <Minus size={iconSize} />
      </motion.button>

      <span className={`${sizeClass} flex items-center justify-center font-semibold text-[var(--color-obsidian)] border-x-2 border-[var(--color-platinum)] min-w-[3rem]`}>
        {value}
      </span>

      <motion.button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className={`${sizeClass} flex items-center justify-center text-[var(--color-obsidian)] hover:bg-[var(--color-pearl)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
        whileTap={{ scale: 0.9 }}
        aria-label="Increase quantity"
      >
        <Plus size={iconSize} />
      </motion.button>
    </div>
  )
}
