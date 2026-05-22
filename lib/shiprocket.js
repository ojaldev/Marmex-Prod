/**
 * Shiprocket API Client
 * Handles authentication, token refresh, and all API calls
 * Token validity: 10 days
 * Base URL: https://apiv2.shiprocket.in/v1/external
 */

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external'

// In-memory token cache (works within same serverless invocation)
let tokenCache = {
    token: null,
    expiresAt: null
}

/**
 * Authenticate with Shiprocket and get a fresh token
 */
async function authenticate() {
    const email = process.env.SHIPROCKET_EMAIL
    const password = process.env.SHIPROCKET_PASSWORD

    if (!email || !password) {
        throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set in environment variables')
    }

    const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(`Shiprocket auth failed: ${data.message || response.statusText}`)
    }

    // Cache token for ~9 days (864000 seconds)
    tokenCache = {
        token: data.token,
        expiresAt: Date.now() + (9 * 24 * 60 * 60 * 1000)
    }

    return data.token
}

/**
 * Get valid token (from cache or fresh auth)
 */
async function getToken() {
    if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
        return tokenCache.token
    }
    return authenticate()
}

/**
 * Make authenticated API call to Shiprocket
 */
async function shiprocketApi(endpoint, options = {}) {
    const token = await getToken()

    const url = endpoint.startsWith('http') ? endpoint : `${SHIPROCKET_BASE_URL}${endpoint}`

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    })

    // If token expired, re-auth and retry once
    if (response.status === 401) {
        tokenCache.token = null
        const newToken = await authenticate()
        const retryResponse = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
                ...options.headers
            }
        })
        return retryResponse
    }

    return response
}

/**
 * Check courier serviceability between pickup and delivery pincodes
 * Returns available couriers with rates and ETAs
 */
export async function checkServiceability({ pickupPostcode, deliveryPostcode, cod = 0, weight = 1 }) {
    const params = new URLSearchParams({
        pickup_postcode: String(pickupPostcode),
        delivery_postcode: String(deliveryPostcode),
        cod: String(cod),
        weight: String(weight)
    })

    const response = await shiprocketApi(`/courier/serviceability/?${params.toString()}`, {
        method: 'GET'
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(`Serviceability check failed: ${data.message || response.statusText}`)
    }

    return data
}

/**
 * Get shipping rates for a specific route
 * This uses the same serviceability API but returns formatted rate data
 */
export async function getShippingRates({ pickupPostcode, deliveryPostcode, cod = 0, weight = 1 }) {
    const data = await checkServiceability({ pickupPostcode, deliveryPostcode, cod, weight })

    // Extract and format available courier options
    const recommendedCouriers = data.data?.available_courier_companies || []

    return recommendedCouriers.map(courier => ({
        id: courier.courier_company_id,
        name: courier.courier_name,
        code: courier.courier_code,
        rate: courier.rate || courier.freight_charge || 0,
        codCharges: courier.cod || 0,
        estimatedDays: courier.estimated_delivery_days || '-',
        rating: courier.courier_rating || 0,
        pickupPerformance: courier.pickup_performance || 0,
        deliveryPerformance: courier.delivery_performance || 0,
        rtoPerformance: courier.rto_performance || 0,
        isRecommended: !!courier.is_recommended
    })).sort((a, b) => a.rate - b.rate)
}

/**
 * Create forward shipment (all-in-one: order + AWB + pickup + label + manifest)
 */
export async function createForwardShipment(payload) {
    const response = await shiprocketApi('/shipments/create/forward-shipment', {
        method: 'POST',
        body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(`Forward shipment failed: ${data.message || data.errors || response.statusText}`)
    }

    return data
}

/**
 * Track shipment by AWB number
 */
export async function trackByAwb(awbCode) {
    const response = await shiprocketApi(`/courier/track/awb/${awbCode}`, {
        method: 'GET'
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(`Tracking failed: ${data.message || response.statusText}`)
    }

    return data
}

/**
 * Track shipment by Order ID
 */
export async function trackByOrderId(orderId, channelId) {
    const params = new URLSearchParams()
    params.append('order_id', String(orderId))
    if (channelId) params.append('channel_id', String(channelId))

    const response = await shiprocketApi(`/courier/track?${params.toString()}`, {
        method: 'GET'
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(`Tracking failed: ${data.message || response.statusText}`)
    }

    return data
}

/**
 * Generate shipping label PDF
 */
export async function generateLabel(shipmentIds) {
    const ids = Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]

    const response = await shiprocketApi('/courier/generate/label', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: ids })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(`Label generation failed: ${data.message || response.statusText}`)
    }

    return data
}

/**
 * Cancel order(s) in Shiprocket
 */
export async function cancelShiprocketOrder(ids) {
    const orderIds = Array.isArray(ids) ? ids : [ids]

    const response = await shiprocketApi('/orders/cancel', {
        method: 'POST',
        body: JSON.stringify({ ids: orderIds })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(`Cancel failed: ${data.message || response.statusText}`)
    }

    return data
}

/**
 * Create return shipment (reverse pickup)
 */
export async function createReturnShipment(payload) {
    const response = await shiprocketApi('/shipments/create/return-shipment', {
        method: 'POST',
        body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(`Return shipment failed: ${data.message || response.statusText}`)
    }

    return data
}

/**
 * Get list of all pickup locations
 */
export async function getPickupLocations() {
    const response = await shiprocketApi('/settings/company/pickup', {
        method: 'GET'
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(`Failed to get pickup locations: ${data.message || response.statusText}`)
    }

    return data
}

/**
 * Logout / invalidate token
 */
export async function logout() {
    const response = await shiprocketApi('/auth/logout', {
        method: 'POST'
    })

    tokenCache = { token: null, expiresAt: null }
    return response.ok
}

// Re-export for direct use
export { getToken, authenticate, shiprocketApi, SHIPROCKET_BASE_URL }
