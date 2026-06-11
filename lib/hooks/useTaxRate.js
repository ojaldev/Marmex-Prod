'use client'

import { useState, useEffect } from 'react'

// Module-level cache so multiple components share one fetch
let cached = null
let promise = null

function fetchRate() {
    if (!promise) {
        promise = fetch('/api/site-config')
            .then(r => r.json())
            .then(data => {
                cached = Number(data?.pricing?.gstRate ?? 18)
                return cached
            })
            .catch(() => {
                cached = 18
                return 18
            })
    }
    return promise
}

export function useTaxRate() {
    const [rate, setRate] = useState(cached ?? 18)

    useEffect(() => {
        if (cached !== null) return
        fetchRate().then(setRate)
    }, [])

    return rate
}
