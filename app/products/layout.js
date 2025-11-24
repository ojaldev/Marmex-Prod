import { Suspense } from 'react'

export default function ProductsLayout({ children }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {children}
        </Suspense>
    )
}
