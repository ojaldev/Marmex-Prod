'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Automatically scrolls to the top of the page whenever the route changes.
 * This ensures users always land at the top of a new page instead of
 * inheriting the scroll position from the previous page.
 */
export default function RouteScrollToTop() {
    const pathname = usePathname()

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [pathname])

    return null
}
