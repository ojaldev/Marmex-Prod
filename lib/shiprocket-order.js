/**
 * Helper to transform a Marmex Order into a Shiprocket Forward Shipment payload
 */

/**
 * Parse dimension string like "18x13x5 inch" or "20x15x10 cm" into cm values
 * Returns { length, breadth, height } in cm
 */
export function parseDimensions(dimensionsStr = '') {
    const match = dimensionsStr.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i)
    if (!match) return { length: 20, breadth: 15, height: 10 }

    let [, l, b, h] = match.map(Number)

    // Convert inches to cm if needed
    if (/inch/i.test(dimensionsStr)) {
        l = Math.round(l * 2.54)
        b = Math.round(b * 2.54)
        h = Math.round(h * 2.54)
    }

    // Ensure minimum dimensions (Shiprocket requires at least 1cm)
    return {
        length: Math.max(l, 1),
        breadth: Math.max(b, 1),
        height: Math.max(h, 1)
    }
}

/**
 * Parse weight string like "1.25 Kg" or "500 g" into kg
 */
export function parseWeight(weightStr = '') {
    const match = weightStr.match(/(\d+(?:\.\d+)?)/)
    if (!match) return 1

    let weight = parseFloat(match[1])

    // Convert grams to kg
    if (/g(?!\w)/i.test(weightStr) && !/kg/i.test(weightStr)) {
        weight = weight / 1000
    }

    return Math.max(weight, 0.1) // Minimum 0.1kg
}

/**
 * Calculate total package dimensions from cart items
 * Uses the largest single item's dimensions (packages aren't combined into one box in Shiprocket API)
 * But for API we submit total weight and representative dimensions
 */
export function calculatePackageDimensions(items = []) {
    if (!items.length) return { length: 20, breadth: 15, height: 10 }

    let totalWeight = 0
    let maxVolume = 0
    let maxDims = { length: 20, breadth: 15, height: 10 }

    for (const item of items) {
        const weight = parseWeight(item.weight)
        const qty = item.quantity || 1
        totalWeight += weight * qty

        const dims = parseDimensions(item.dimensions)
        const volume = dims.length * dims.breadth * dims.height
        if (volume > maxVolume) {
            maxVolume = volume
            maxDims = dims
        }
    }

    return {
        weight: Math.max(totalWeight, 0.5), // Minimum 0.5kg for API
        ...maxDims
    }
}

/**
 * Build Shiprocket Forward Shipment payload from Marmex Order
 */
export function buildForwardShipmentPayload(order, options = {}) {
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'warehouse'
    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '110001'

    const { shippingAddress, billingAddress, items, orderNumber, total, subtotal, shipping, discount, payment, shippingMethod } = order

    const addr = shippingAddress || billingAddress
    const billAddr = billingAddress || shippingAddress

    // Calculate package details
    const pkg = calculatePackageDimensions(items)

    // Format order date: "2026-05-19 11:30"
    const now = new Date()
    const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // Build order items
    const orderItems = items.map((item, idx) => ({
        name: item.name?.substring(0, 100) || `Product ${idx + 1}`,
        sku: item.productId?.toString()?.substring(0, 50) || `SKU-${idx + 1}`,
        units: item.quantity || 1,
        selling_price: Math.round(item.price || 0),
        discount: Math.round(item.discount || 0),
        tax: 0 // GST is included in selling_price
    }))

    // Determine payment method for Shiprocket
    const isCod = payment?.method === 'cod'
    const shiprocketPaymentMethod = isCod ? 'COD' : 'Prepaid'

    const payload = {
        order_id: orderNumber,
        order_date: orderDate,
        pickup_location: pickupLocation,
        channel_id: options.channelId || '',

        // Billing
        billing_customer_name: billAddr?.name?.split(' ')[0] || 'Customer',
        billing_last_name: billAddr?.name?.split(' ').slice(1).join(' ') || '',
        billing_address: billAddr?.line1 || '',
        billing_address_2: billAddr?.line2 || '',
        billing_city: billAddr?.city || '',
        billing_pincode: String(billAddr?.pincode || ''),
        billing_state: billAddr?.state || '',
        billing_country: 'India',
        billing_email: order.user?.email || order.guestEmail || 'customer@marmex.in',
        billing_phone: String(billAddr?.phone || '').replace(/\D/g, '').slice(-10),

        // Shipping (usually same as billing)
        shipping_is_billing: true,

        // If shipping differs, add these:
        // shipping_customer_name: addr?.name?.split(' ')[0] || '',
        // shipping_last_name: addr?.name?.split(' ').slice(1).join(' ') || '',
        // shipping_address: addr?.line1 || '',
        // shipping_address_2: addr?.line2 || '',
        // shipping_city: addr?.city || '',
        // shipping_pincode: String(addr?.pincode || ''),
        // shipping_state: addr?.state || '',
        // shipping_country: 'India',
        // shipping_email: order.user?.email || order.guestEmail || '',
        // shipping_phone: String(addr?.phone || ''),

        order_items: orderItems,
        payment_method: shiprocketPaymentMethod,

        shipping_charges: Math.round(shipping || 0),
        giftwrap_charges: Math.round(order.giftOptions?.cost || 0),
        transaction_charges: 0,
        total_discount: Math.round(discount || 0),
        sub_total: Math.round(subtotal || total || 0),

        // Package dimensions
        weight: pkg.weight,
        length: pkg.length,
        breadth: pkg.breadth,
        height: pkg.height,

        // Request all services
        request_pickup: true,
        print_label: true,
        generate_manifest: true,

        // Optional: specify courier if selected during checkout
        ...(shippingMethod?.shiprocketCourierId ? { courier_id: shippingMethod.shiprocketCourierId } : {}),

        // E-waybill (for high-value orders > ₹50,000)
        ...(total >= 50000 ? { order_type: 'B2C' } : {})
    }

    return payload
}
