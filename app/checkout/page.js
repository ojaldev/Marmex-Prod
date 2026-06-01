'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import AddressSelector from '@/components/checkout/AddressSelector'
import ShiprocketShippingSelector from '@/components/checkout/ShiprocketShippingSelector'
import GiftOptions from '@/components/checkout/GiftOptions'
import GSTInvoice from '@/components/checkout/GSTInvoice'
import PromoCodeInput from '@/components/checkout/PromoCodeInput'
import { ArrowLeft, Lock, Check, Loader2, CreditCard, Truck, Shield, ChevronRight } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import styles from './checkout.module.css'

// Load Razorpay script
const loadRazorpay = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true)
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
    const { cart, getCartTotal, getCartWeight, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [razorpayLoaded, setRazorpayLoaded] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)

    // Form state
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [manualAddress, setManualAddress] = useState({
        firstName: '', lastName: '', phone: '', email: '',
        line1: '', line2: '', city: '', state: '', pincode: ''
    })
    const [shippingMethod, setShippingMethod] = useState(null)

    const cartWeight = getCartWeight()

    // Get destination pincode from selected address
    const destinationPincode = selectedAddress?.pincode || manualAddress.pincode || ''
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
    const tax = taxableAmount * 0.18
    const total = taxableAmount + tax

    const handleAddressSelect = (address) => setSelectedAddress(address)

    const handleManualAddressChange = (e) => {
        setManualAddress(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const getShippingAddress = () => {
        if (selectedAddress) return selectedAddress
        return {
            name: `${manualAddress.firstName} ${manualAddress.lastName}`,
            phone: manualAddress.phone,
            line1: manualAddress.line1, line2: manualAddress.line2,
            city: manualAddress.city, state: manualAddress.state, pincode: manualAddress.pincode
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!shippingMethod) { alert('Please select a shipping method'); return }

        setLoading(true)
        try {
            const orderData = {
                items: cart.map(item => ({
                    productId: item.id, name: item.name, price: item.price,
                    discount: item.discount || 0, quantity: item.quantity,
                    image: item.mainImage || item.image
                })),
                shippingAddress: getShippingAddress(), billingAddress: getShippingAddress(),
                paymentMethod: paymentMethod === 'cod' ? 'cod' : 'card',
                guestEmail: !session ? manualAddress.email : undefined,
                promoCode: appliedPromo?.code, shippingMethod,
                giftOptions: giftData, gstInvoice: gstData,
                subtotal, tax, shipping: shippingCost, discount: promoDiscount, total
            }

            const orderRes = await fetch('/api/orders', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })
            const orderResult = await orderRes.json()
            if (!orderRes.ok) throw new Error(orderResult.error || 'Failed to create order')

            const orderId = orderResult.order.id

            if (paymentMethod === 'cod') {
                clearCart()
                router.push(`/order-confirmation?order=${orderResult.order.orderNumber}`)
                return
            }

            if (!razorpayLoaded) throw new Error('Payment system not loaded')

            const paymentOrderRes = await fetch('/api/payment/create-order', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total, orderId,
                    customerInfo: { name: getShippingAddress().name, email: session?.user?.email || manualAddress.email }
                })
            })
            const paymentData = await paymentOrderRes.json()
            if (!paymentOrderRes.ok) throw new Error(paymentData.error || 'Payment initialization failed')

            const options = {
                key: paymentData.keyId, amount: paymentData.amount,
                currency: paymentData.currency, order_id: paymentData.razorpayOrderId,
                name: 'Marmex India', description: `Order ${orderResult.order.orderNumber}`,
                image: '/logo.png',
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                orderId, promoCode: appliedPromo?.code
                            })
                        })
                        if (verifyRes.ok) {
                            clearCart()
                            router.push(`/order-confirmation?order=${orderResult.order.orderNumber}`)
                        } else throw new Error('Payment verification failed')
                    } catch (error) {
                        alert('Payment verification failed. Please contact support.')
                    }
                },
                prefill: {
                    name: getShippingAddress().name,
                    email: session?.user?.email || manualAddress.email,
                    contact: getShippingAddress().phone
                },
                theme: { color: '#D4A574' },
                modal: { ondismiss: function () { setLoading(false) } }
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
                    <motion.div
                        className={styles.emptyState}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Truck size={64} className="text-[var(--color-platinum)]" />
                        <h1>Your cart is empty</h1>
                        <p>Add some products before proceeding to checkout</p>
                        <Link href="/products" className="btn btn-primary">Browse Products</Link>
                    </motion.div>
                </div>
            </main>
        )
    }

    const steps = [
        { number: 1, label: 'Shipping', icon: Truck },
        { number: 2, label: 'Delivery', icon: Shield },
        { number: 3, label: 'Payment', icon: CreditCard },
        { number: 4, label: 'Review', icon: Check },
    ]

    const getStepStatus = (stepNum) => {
        if (stepNum < currentStep) return 'completed'
        if (stepNum === currentStep) return 'active'
        return 'pending'
    }

    return (
        <main className={styles.checkoutPage}>
            <div className="container">
                {/* Header */}
                <motion.div
                    className={styles.checkoutHeader}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link href="/cart" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        Back to Cart
                    </Link>
                    <h1>Secure Checkout</h1>
                    <div className={styles.secureIndicator}>
                        <Lock size={16} />
                        <span>SSL Secure</span>
                    </div>
                </motion.div>

                {/* Progress Steps */}
                <motion.div
                    className={styles.progressSteps}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {steps.map((step, i) => (
                        <div key={step.number} className={styles.stepWrapper}>
                            <motion.div
                                className={`${styles.step} ${styles[getStepStatus(step.number)]}`}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setCurrentStep(step.number)}
                            >
                                <div className={styles.stepNumber}>
                                    {getStepStatus(step.number) === 'completed' ? (
                                        <Check size={18} />
                                    ) : (
                                        <step.icon size={18} />
                                    )}
                                </div>
                                <span className={styles.stepLabel}>{step.label}</span>
                            </motion.div>
                            {i < steps.length - 1 && (
                                <div className={`${styles.stepLine} ${getStepStatus(step.number) === 'completed' ? styles.completedLine : ''}`} />
                            )}
                        </div>
                    ))}
                </motion.div>

                <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
                    {/* Left Column - Form */}
                    <motion.div
                        className={styles.formSection}
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Shipping Step */}
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    {session ? (
                                        <AddressSelector onSelect={handleAddressSelect} selectedAddress={selectedAddress} />
                                    ) : (
                                        <section className={styles.formGroup}>
                                            <h2><Truck size={20} /> Shipping Information</h2>
                                            <div className={styles.inputGrid}>
                                                {['firstName', 'lastName'].map(field => (
                                                    <div key={field} className={styles.inputWrapper}>
                                                        <input type="text" name={field} value={manualAddress[field]} onChange={handleManualAddressChange} placeholder=" " required />
                                                        <label>{field === 'firstName' ? 'First Name' : 'Last Name'} *</label>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={styles.inputGrid}>
                                                <div className={styles.inputWrapper}>
                                                    <input type="email" name="email" value={manualAddress.email} onChange={handleManualAddressChange} placeholder=" " required />
                                                    <label>Email *</label>
                                                </div>
                                                <div className={styles.inputWrapper}>
                                                    <input type="tel" name="phone" value={manualAddress.phone} onChange={handleManualAddressChange} placeholder=" " required />
                                                    <label>Phone *</label>
                                                </div>
                                            </div>
                                            <div className={styles.inputWrapper}>
                                                <input type="text" name="line1" value={manualAddress.line1} onChange={handleManualAddressChange} placeholder=" " required />
                                                <label>Address Line 1 *</label>
                                            </div>
                                            <div className={styles.inputWrapper}>
                                                <input type="text" name="line2" value={manualAddress.line2} onChange={handleManualAddressChange} placeholder=" " />
                                                <label>Address Line 2</label>
                                            </div>
                                            <div className={styles.inputGrid}>
                                                {['city', 'state', 'pincode'].map(field => (
                                                    <div key={field} className={styles.inputWrapper}>
                                                        <input type="text" name={field} value={manualAddress[field]} onChange={handleManualAddressChange} placeholder=" " required />
                                                        <label>{field.charAt(0).toUpperCase() + field.slice(1)} *</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                    <motion.button
                                        type="button"
                                        className={styles.nextStepBtn}
                                        onClick={() => setCurrentStep(2)}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Continue to Delivery
                                        <ChevronRight size={18} />
                                    </motion.button>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <ShiprocketShippingSelector
                                        destinationPincode={destinationPincode}
                                        cartTotal={subtotal}
                                        cartWeight={cartWeight || 1}
                                        isCod={paymentMethod === 'cod'}
                                        onSelect={setShippingMethod}
                                        selectedMethod={shippingMethod}
                                    />
                                    <GiftOptions onUpdate={setGiftData} giftData={giftData} />
                                    <GSTInvoice onUpdate={setGSTData} gstData={gstData} />
                                    <div className={styles.stepNav}>
                                        <button type="button" className={styles.backStepBtn} onClick={() => setCurrentStep(1)}>
                                            <ArrowLeft size={16} /> Back
                                        </button>
                                        <motion.button
                                            type="button"
                                            className={styles.nextStepBtn}
                                            onClick={() => setCurrentStep(3)}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Continue to Payment
                                            <ChevronRight size={18} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <section className={styles.paymentMethod}>
                                        <h2><CreditCard size={20} /> Payment Method</h2>
                                        <div className={styles.paymentOptions}>
                                            <motion.label
                                                className={`${styles.paymentOption} ${paymentMethod === 'razorpay' ? styles.selected : ''}`}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                                <div className={styles.paymentContent}>
                                                    <strong>Online Payment</strong>
                                                    <span>UPI, Cards, Wallets, Net Banking</span>
                                                </div>
                                            </motion.label>
                                            <motion.label
                                                className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.selected : ''}`}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                                <div className={styles.paymentContent}>
                                                    <strong>Cash on Delivery</strong>
                                                    <span>Pay when you receive</span>
                                                </div>
                                            </motion.label>
                                        </div>
                                    </section>
                                    <div className={styles.stepNav}>
                                        <button type="button" className={styles.backStepBtn} onClick={() => setCurrentStep(2)}>
                                            <ArrowLeft size={16} /> Back
                                        </button>
                                        <motion.button
                                            type="button"
                                            className={styles.nextStepBtn}
                                            onClick={() => setCurrentStep(4)}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Review Order
                                            <ChevronRight size={18} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <section className={styles.formGroup}>
                                        <h2><Check size={20} /> Review Your Order</h2>
                                        <div className={styles.reviewSection}>
                                            <h4>Shipping Address</h4>
                                            <p>{getShippingAddress().name}</p>
                                            <p>{getShippingAddress().line1}</p>
                                            <p>{getShippingAddress().city}, {getShippingAddress().state} - {getShippingAddress().pincode}</p>
                                            <p>Phone: {getShippingAddress().phone}</p>
                                        </div>
                                        <div className={styles.reviewSection}>
                                            <h4>Delivery</h4>
                                            <p>{shippingMethod?.name || 'Not selected'}</p>
                                            <p>ETA: {shippingMethod?.estimatedDays || '3-5'} business days</p>
                                        </div>
                                        <div className={styles.reviewSection}>
                                            <h4>Payment</h4>
                                            <p>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</p>
                                        </div>
                                    </section>
                                    <div className={styles.stepNav}>
                                        <button type="button" className={styles.backStepBtn} onClick={() => setCurrentStep(3)}>
                                            <ArrowLeft size={16} /> Back
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Right Column - Order Summary */}
                    <motion.div
                        className={styles.summarySection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className={styles.summaryCard}>
                            <h2>Order Summary</h2>

                            <div className={styles.summaryItems}>
                                {cart.map(item => {
                                    const itemPrice = item.discount > 0 ? item.price * (100 - item.discount) / 100 : item.price
                                    return (
                                        <div key={item.id} className={styles.summaryItem}>
                                            <div className={styles.itemImageSmall}>
                                                {item.mainImage && (
                                                    <Image src={item.mainImage} alt={item.name} fill className="object-cover rounded" sizes="48px" />
                                                )}
                                            </div>
                                            <div className={styles.itemDetails}>
                                                <span className={styles.itemName}>{item.name}</span>
                                                <span className={styles.itemQty}>Qty: {item.quantity}</span>
                                            </div>
                                            <span className={styles.itemPrice}>₹{(itemPrice * item.quantity).toLocaleString()}</span>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className={styles.summaryDivider} />

                            <PromoCodeInput orderTotal={subtotal} onApply={setAppliedPromo} onRemove={() => setAppliedPromo(null)} appliedPromo={appliedPromo} />

                            <div className={styles.summaryDivider} />

                            <div className={styles.summaryRow}><span>Subtotal:</span><span>₹{subtotal.toLocaleString()}</span></div>
                            {promoDiscount > 0 && <div className={styles.summaryRow}><span>Promo Discount:</span><span className={styles.discount}>-₹{promoDiscount.toLocaleString()}</span></div>}
                            <div className={styles.summaryRow}><span>Shipping:</span><span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString()}`}</span></div>
                            {giftCost > 0 && <div className={styles.summaryRow}><span>Gift Wrapping:</span><span>₹{giftCost.toLocaleString()}</span></div>}
                            <div className={styles.summaryRow}><span>Tax (GST 18%):</span><span>₹{tax.toFixed(2)}</span></div>

                            <div className={styles.summaryDivider} />

                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Total:</span>
                                <strong>₹{total.toFixed(2)}</strong>
                            </div>

                            <motion.button
                                type="submit"
                                className={`btn btn-primary w-full mt-6 ${styles.checkoutBtn}`}
                                disabled={loading}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                ) : (
                                    <><Lock size={18} /> {paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}</>
                                )}
                            </motion.button>

                            <div className={styles.secureNote}>
                                <Lock size={14} />
                                <span>Secure {paymentMethod === 'cod' ? 'Checkout' : 'Payment'} powered by Razorpay</span>
                            </div>
                        </div>
                    </motion.div>
                </form>
            </div>
        </main>
    )
}
