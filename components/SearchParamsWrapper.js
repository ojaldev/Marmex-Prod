'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SearchParamsContent({ children }) {
    const searchParams = useSearchParams()
    return children(searchParams)
}

export default function SearchParamsWrapper({ children }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchParamsContent>{children}</SearchParamsContent>
        </Suspense>
    )
}
