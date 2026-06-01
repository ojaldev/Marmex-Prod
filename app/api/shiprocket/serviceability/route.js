import { NextResponse } from 'next/server'
import { checkServiceability } from '@/lib/shiprocket'
import { parseWeight } from '@/lib/shiprocket-order'

/**
 * GET /api/shiprocket/serviceability?deliveryPincode=560064&cod=0&weight=1
 * 
 * Checks if a delivery pincode is serviceable from the warehouse.
 * Returns available couriers, rates, and estimated delivery days.
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

        // Validate pincode format (6 digits)
        if (!/^\d{6}$/.test(deliveryPincode)) {
            return NextResponse.json(
                { error: 'Invalid pincode format. Must be 6 digits.' },
                { status: 400 }
            )
        }

        const data = await checkServiceability({
            pickupPostcode: pickupPincode,
            deliveryPostcode: deliveryPincode,
            cod,
            weight
        })

        // DEBUG: Log full Shiprocket response for troubleshooting
        console.log('Shiprocket serviceability response:', {
            pickupPincode,
            deliveryPincode,
            cod,
            weight,
            hasData: !!data.data,
            availableCouriersCount: data.data?.available_courier_companies?.length || 0,
            recommendedCourierCount: data.data?.recommended_courier_company_id || 0,
            responseKeys: Object.keys(data),
            fullResponse: JSON.stringify(data).slice(0, 2000)
        })

        // Format response for frontend
        const availableCouriers = data.data?.available_courier_companies || []
        const isServiceable = availableCouriers.length > 0

        const couriers = availableCouriers.map(c => ({
            id: c.courier_company_id,
            name: c.courier_name,
            code: c.courier_code,
            rate: c.rate || c.freight_charge || 0,
            codCharges: c.cod || 0,
            estimatedDays: c.estimated_delivery_days || '-',
            rating: c.courier_rating || 0,
            pickupPerformance: c.pickup_performance || 0,
            deliveryPerformance: c.delivery_performance || 0,
            isRecommended: !!c.is_recommended
        })).sort((a, b) => a.rate - b.rate)

        // Check if Shiprocket returned an error message instead of courier data
        const shiprocketMessage = data.message || data.data?.message
        if (shiprocketMessage && !isServiceable) {
            console.warn('Shiprocket serviceability message:', shiprocketMessage)
        }

        return NextResponse.json({
            serviceable: isServiceable,
            pickupPincode,
            deliveryPincode,
            couriers,
            cod,
            weight,
            shiprocketMessage: shiprocketMessage || null,
            // Add a recommended option
            recommended: couriers.find(c => c.isRecommended) || couriers[0] || null
        })

    } catch (error) {
        console.error('Shiprocket serviceability error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to check serviceability' },
            { status: 500 }
        )
    }
}
