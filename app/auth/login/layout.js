import { Suspense } from 'react'

export default function LoginLayout({ children }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {children}
        </Suspense>
    )
}
