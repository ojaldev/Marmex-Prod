'use client'

import dynamic from 'next/dynamic'

const ScrollProgress = dynamic(() => import('./ScrollProgress'), { ssr: false })
const ScrollToTop = dynamic(() => import('./ScrollToTop'), { ssr: false })

export default function DynamicLayoutExtras() {
    return (
        <>
            <ScrollProgress />
            <ScrollToTop />
        </>
    )
}
