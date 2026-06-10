// Shared client-side store for the last successful pincode serviceability check,
// so delivery confidence shown on the product page carries into the cart.

const STORAGE_KEY = 'marmex-delivery-estimate'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // re-check after 7 days

export function saveDeliveryEstimate({ pincode, estimatedDays, courierName, rate }) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            pincode,
            estimatedDays,
            courierName,
            rate,
            checkedAt: Date.now()
        }))
    } catch {
        // ignore
    }
}

export function getDeliveryEstimate() {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const saved = JSON.parse(raw)
        if (!saved.pincode || Date.now() - (saved.checkedAt || 0) > MAX_AGE_MS) {
            localStorage.removeItem(STORAGE_KEY)
            return null
        }
        return saved
    } catch {
        return null
    }
}

export function formatDeliveryDate(estimatedDays) {
    const days = parseInt(estimatedDays, 10)
    if (isNaN(days)) return null
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}
