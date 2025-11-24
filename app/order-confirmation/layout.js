import { Suspense } from 'react'

export default function OrderConfirmationLayout({ children }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {children}
        </Suspense>
    )
}
