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

  const sizes = {
    small: {
      wrap: 'h-8 gap-1',
      btn: 'w-7 h-7',
      icon: 12,
      num: 'w-7 text-sm',
    },
    medium: {
      wrap: 'h-11 gap-1.5',
      btn: 'w-10 h-10',
      icon: 16,
      num: 'w-10 text-base',
    },
    large: {
      wrap: 'h-14 gap-2',
      btn: 'w-12 h-12',
      icon: 18,
      num: 'w-12 text-lg',
    },
  }

  const s = sizes[size] || sizes.medium

  return (
    <div className={`inline-flex items-center ${s.wrap}`}>
      <motion.button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className={`${s.btn} flex items-center justify-center rounded-full border-2 border-[var(--color-platinum)] bg-white text-[var(--color-obsidian)] transition-all duration-200 hover:border-[var(--color-gold-24k)] hover:bg-[var(--color-gold-24k)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[var(--color-platinum)] disabled:hover:bg-white disabled:hover:text-[var(--color-obsidian)]`}
        whileTap={{ scale: 0.9 }}
        aria-label="Decrease quantity"
      >
        <Minus size={s.icon} strokeWidth={2.5} />
      </motion.button>

      <span className={`${s.num} flex items-center justify-center font-bold text-[var(--color-obsidian)] tabular-nums select-none`}>
        {value}
      </span>

      <motion.button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className={`${s.btn} flex items-center justify-center rounded-full border-2 border-[var(--color-platinum)] bg-white text-[var(--color-obsidian)] transition-all duration-200 hover:border-[var(--color-gold-24k)] hover:bg-[var(--color-gold-24k)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[var(--color-platinum)] disabled:hover:bg-white disabled:hover:text-[var(--color-obsidian)]`}
        whileTap={{ scale: 0.9 }}
        aria-label="Increase quantity"
      >
        <Plus size={s.icon} strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}
