import { Suspense } from 'react'

export default function ResetPasswordLayout({ children }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {children}
        </Suspense>
    )
}
