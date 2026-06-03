import { Cormorant_Garamond, Inter, Outfit } from 'next/font/google'

export const fontDisplay = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
    variable: '--font-display-src',
    display: 'swap',
    fallback: ['Georgia', 'serif'],
})

export const fontBody = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-body-src',
    display: 'swap',
    fallback: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
})

export const fontAccent = Outfit({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-accent-src',
    display: 'swap',
    fallback: ['Inter', 'sans-serif'],
})
