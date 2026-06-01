import { NextResponse } from 'next/server'
import { getShippingRates } from '@/lib/shiprocket'
import { parseWeight } from '@/lib/shiprocket-order'

/**
 * GET /api/shiprocket/rates?deliveryPincode=560064&cod=0&weight=1.5
 * 
 * Returns live shipping rates from Shiprocket for the given route.
 * Used during checkout to show real-time courier options.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const deliveryPincode = searchParams.get('deliveryPincode')
        const cod = parseInt(searchParams.get('cod') || '0')
        const weightParam = searchParams.get('weight') || '1'
        const weight = parseWeight(weightParam)

        const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE

        if (!pickupPincode) {
            return NextResponse.json(
                { error: 'Pickup pincode not configured. Set SHIPROCKET_PICKUP_PINCODE in .env.local' },
                { status: 500 }
            )
        }

        if (!deliveryPincode) {
            return NextResponse.json(
                { error: 'Delivery pincode is required' },
                { status: 400 }
            )
        }

        if (!/^\d{6}$/.test(deliveryPincode)) {
            return NextResponse.json(
                { error: 'Invalid pincode format. Must be 6 digits.' },
                { status: 400 }
            )
        }

        const rates = await getShippingRates({
            pickupPostcode: pickupPincode,
            deliveryPostcode: deliveryPincode,
            cod,
            weight
        })

        return NextResponse.json({
            success: true,
            pickupPincode,
            deliveryPincode,
            rates,
            count: rates.length,
            recommended: rates.find(r => r.isRecommended) || rates[0] || null
        })

    } catch (error) {
        console.error('Shiprocket rates error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch shipping rates' },
            { status: 500 }
        )
    }
}
