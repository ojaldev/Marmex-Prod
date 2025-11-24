'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import AddressSelector from '@/components/checkout/AddressSelector'
import DeliveryDatePicker from '@/components/checkout/DeliveryDatePicker'
import ShippingMethodSelector from '@/components/checkout/ShippingMethodSelector'
import GiftOptions from '@/components/checkout/GiftOptions'
import GSTInvoice from '@/components/checkout/GSTInvoice'
import PromoCodeInput from '@/components/checkout/PromoCodeInput'
import { ArrowLeft, Lock } from 'lucide-react'
import styles from './checkout.module.css'

// Load Razorpay script
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

export default function CheckoutPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const { cart, getCartTotal, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [razorpayLoaded, setRazorpayLoaded] = useState(false)

    // Form state
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [manualAddress, setManualAddress] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: ''
    })
    const [deliveryDate, setDeliveryDate] = useState(null)
    const [shippingMethod, setShippingMethod] = useState(null)
    const [giftData, setGiftData] = useState({ isGift: false, message: '', cost: 0 })
    const [gstData, setGSTData] = useState({ needsGST: false })
    const [appliedPromo, setAppliedPromo] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('razorpay')

    useEffect(() => {
        loadRazorpay().then(setRazorpayLoaded)
    }, [])

    // Calculate totals
    const subtotal = getCartTotal()
    const promoDiscount = appliedPromo?.discount || 0
    const shippingCost = shippingMethod?.cost || 0
    const giftCost = giftData?.cost || 0
    const taxableAmount = subtotal - promoDiscount + shippingCost + giftCost
    const tax = taxableAmount * 0.18 // 18% GST
    const total = taxableAmount + tax

    const handleAddressSelect = (address) => {
        setSelectedAddress(address)
    }

    const handleManualAddressChange = (e) => {
        setManualAddress(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const getShippingAddress = () => {
        if (selectedAddress) {
            return selectedAddress
        }

        return {
            name: `${manualAddress.firstName} ${manualAddress.lastName}`,
            phone: manualAddress.phone,
            line1: manualAddress.line1,
            line2: manualAddress.line2,
            city: manualAddress.city,
            state: manualAddress.state,
            pincode: manualAddress.pincode
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!deliveryDate) {
            alert('Please select a delivery date')
            return
        }

        if (!shippingMethod) {
            alert('Please select a shipping method')
            return
        }

        setLoading(true)

        try {
            // Create order in database first
            const orderData = {
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    discount: item.discount || 0,
                    quantity: item.quantity,
                    image: item.mainImage || item.image
                })),
                shippingAddress: getShippingAddress(),
                billingAddress: getShippingAddress(),
                paymentMethod: paymentMethod === 'cod' ? 'cod' : 'card',
                guestEmail: !session ? manualAddress.email : undefined,
                promoCode: appliedPromo?.code,
                deliveryDate,
                shippingMethod,
                giftOptions: giftData,
                gstInvoice: gstData,
                subtotal,
                tax,
                shipping: shippingCost,
                discount: promoDiscount,
                total
            }

            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })

            const orderResult = await orderRes.json()

            if (!orderRes.ok) {
                throw new Error(orderResult.error || 'Failed to create order')
            }

            const orderId = orderResult.order.id

            // Handle COD
            if (paymentMethod === 'cod') {
                clearCart()
                router.push(`/order-confirmation?order=${orderResult.order.orderNumber}`)
                return
            }

            // Handle Razorpay payment
            if (!razorpayLoaded) {
                throw new Error('Payment system not loaded')
            }

            // Create Razorpay order
            const paymentOrderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total,
                    orderId: orderId,
                    customerInfo: {
                        name: getShippingAddress().name,
                        email: session?.user?.email || manualAddress.email
                    }
                })
            })

            const paymentData = await paymentOrderRes.json()

            if (!paymentOrderRes.ok) {
                throw new Error(paymentData.error || 'Payment initialization failed')
            }

            // Open Razorpay checkout
            const options = {
                key: paymentData.keyId,
                amount: paymentData.amount,
                currency: paymentData.currency,
                order_id: paymentData.razorpayOrderId,
                name: 'Marmex India',
                description: `Order ${orderResult.order.orderNumber}`,
                image: '/logo.png',
                handler: async function (response) {
                    try {
                        // Verify payment
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                orderId: orderId,
                                promoCode: appliedPromo?.code
                            })
                        })

                        if (verifyRes.ok) {
                            clearCart()
                            router.push(`/order-confirmation?order=${orderResult.order.orderNumber}`)
                        } else {
                            throw new Error('Payment verification failed')
                        }
                    } catch (error) {
                        alert('Payment verification failed. Please contact support.')
                    }
                },
                prefill: {
                    name: getShippingAddress().name,
                    email: session?.user?.email || manualAddress.email,
                    contact: getShippingAddress().phone
                },
                theme: {
                    color: '#D4A574'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false)
                    }
                }
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()

        } catch (error) {
            console.error('Checkout error:', error)
            alert(error.message || 'Checkout failed. Please try again.')
            setLoading(false)
        }
    }

    if (cart.length === 0) {
        return (
            <main className={styles.checkoutPage}>
                <div className="container">
                    <div className={styles.emptyState}>
                        <h1>Your cart is empty</h1>
                        <p>Add some products before proceeding to checkout</p>
                        <Link href="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.checkoutPage}>
            <div className="container">
                <Link href="/cart" className={styles.backLink}>
                    <ArrowLeft size={20} />
                    Back to Cart
                </Link>

                <h1>Secure Checkout</h1>

                <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
                    {/* Left Column - Form */}
                    <div className={styles.formSection}>
                        {/* Address Selection */}
                        {session ? (
                            <AddressSelector
                                onSelect={handleAddressSelect}
                                selectedAddress={selectedAddress}
                            />
                        ) : (
                            <section className={styles.formGroup}>
                                <h2>Shipping Information</h2>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={manualAddress.firstName}
                                            onChange={handleManualAddressChange}
                                            placeholder=" "
                                            required
                                        />
                                        <label>First Name *</label>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={manualAddress.lastName}
                                            onChange={handleManualAddressChange}
                                            placeholder=" "
                                            required
                                        />
                                        <label>Last Name *</label>
                                    </div>
                                </div>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={manualAddress.email}
                                            onChange={handleManualAddressChange}
                                            placeholder=" "
                                            required
                                        />
                                        <label>Email *</label>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={manualAddress.phone}
                                            onChange={handleManualAddressChange}
                                            placeholder=" "
                                            required
                                        />
                                        <label>Phone *</label>
                                    </div>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        name="line1"
                                        value={manualAddress.line1}
                                        onChange={handleManualAddressChange}
                                        placeholder=" "
                                        required
                                    />
                                    <label>Address Line 1 *</label>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        name="line2"
                                        value={manualAddress.line2}
                                        onChange={handleManualAddressChange}
                                        placeholder=" "
                                    />
                                    <label>Address Line 2</label>
                                </div>
                                <div className={styles.inputGrid}>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="text"
                                            name="city"
                                            value={manualAddress.city}
                                            onChange={handleManualAddressChange}
                                            placeholder=" "
                                            required
                                        />
                                        <label>City *</label>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="text"
                                            name="state"
                                            value={manualAddress.state}
                                            onChange={handleManualAddressChange}
                                            placeholder=" "
                                            required
                                        />
                                        <label>State *</label>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={manualAddress.pincode}
                                            onChange={handleManualAddressChange}
                                            placeholder=" "
                                            required
                                            maxLength="6"
                                        />
                                        <label>PIN Code *</label>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Delivery Date */}
                        <DeliveryDatePicker
                            onSelect={setDeliveryDate}
                            selectedDate={deliveryDate}
                        />

                        {/* Shipping Method */}
                        <ShippingMethodSelector
                            onSelect={setShippingMethod}
                            selectedMethod={shippingMethod}
                            cartTotal={subtotal}
                        />

                        {/* Gift Options */}
                        <GiftOptions
                            onUpdate={setGiftData}
                            giftData={giftData}
                        />

                        {/* GST Invoice */}
                        <GSTInvoice
                            onUpdate={setGSTData}
                            gstData={gstData}
                        />

                        {/* Payment Method */}
                        <section className={styles.paymentMethod}>
                            <h3>Payment Method</h3>
                            <div className={styles.paymentOptions}>
                                <label className={styles.paymentOption}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="razorpay"
                                        checked={paymentMethod === 'razorpay'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Online Payment (UPI, Cards, Wallets, Net Banking)</span>
                                </label>
                                <label className={styles.paymentOption}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Cash on Delivery</span>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className={styles.summarySection}>
                        <div className={styles.summaryCard}>
                            <h2>Order Summary</h2>

                            {/* Cart Items */}
                            <div className={styles.summaryItems}>
                                {cart.map(item => {
                                    const itemPrice = item.discount > 0
                                        ? item.price * (100 - item.discount) / 100
                                        : item.price

                                    return (
                                        <div key={item.id} className={styles.summaryItem}>
                                            <div className={styles.itemDetails}>
                                                <span className={styles.itemName}>{item.name}</span>
                                                <span className={styles.itemQty}>Qty: {item.quantity}</span>
                                            </div>
                                            <span className={styles.itemPrice}>
                                                ₹{(itemPrice * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className={styles.summaryDivider} />

                            {/* Promo Code */}
                            <PromoCodeInput
                                orderTotal={subtotal}
                                onApply={setAppliedPromo}
                                onRemove={() => setAppliedPromo(null)}
                                appliedPromo={appliedPromo}
                            />

                            <div className={styles.summaryDivider} />

                            {/* Totals */}
                            <div className={styles.summaryRow}>
                                <span>Subtotal:</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>

                            {promoDiscount > 0 && (
                                <div className={styles.summaryRow}>
                                    <span>Promo Discount:</span>
                                    <span className={styles.discount}>-₹{promoDiscount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className={styles.summaryRow}>
                                <span>Shipping:</span>
                                <span>
                                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString()}`}
                                </span>
                            </div>

                            {giftCost > 0 && (
                                <div className={styles.summaryRow}>
                                    <span>Gift Wrapping:</span>
                                    <span>₹{giftCost.toLocaleString()}</span>
                                </div>
                            )}

                            <div className={styles.summaryRow}>
                                <span>Tax (GST 18%):</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>

                            <div className={styles.summaryDivider} />

                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Total:</span>
                                <strong>₹{total.toFixed(2)}</strong>
                            </div>

                            <button
                                type="submit"
                                className={`btn btn-primary ${styles.checkoutBtn}`}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : `${paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}`}
                            </button>

                            <div className={styles.secureNote}>
                                <Lock size={16} />
                                <span>Secure {paymentMethod === 'cod' ? 'Checkout' : 'Payment'}</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}
