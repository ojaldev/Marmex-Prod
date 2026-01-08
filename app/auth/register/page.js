'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../auth.module.css'

export default function RegisterPage() {
    const router = useRouter()

    // Country codes list
    const countryCodes = [
        { code: '+91', country: 'India', flag: '🇮🇳' },
        { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
        { code: '+44', country: 'UK', flag: '🇬🇧' },
        { code: '+971', country: 'UAE', flag: '🇦🇪' },
        { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
        { code: '+65', country: 'Singapore', flag: '🇸🇬' },
        { code: '+61', country: 'Australia', flag: '🇦🇺' },
        { code: '+49', country: 'Germany', flag: '🇩🇪' },
        { code: '+33', country: 'France', flag: '🇫🇷' },
        { code: '+81', country: 'Japan', flag: '🇯🇵' },
        { code: '+86', country: 'China', flag: '🇨🇳' },
        { code: '+82', country: 'South Korea', flag: '🇰🇷' },
        { code: '+39', country: 'Italy', flag: '🇮🇹' },
        { code: '+34', country: 'Spain', flag: '🇪🇸' },
        { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
        { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
        { code: '+46', country: 'Sweden', flag: '🇸🇪' },
        { code: '+47', country: 'Norway', flag: '🇳🇴' },
        { code: '+45', country: 'Denmark', flag: '🇩🇰' },
        { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
        { code: '+27', country: 'South Africa', flag: '🇿🇦' },
        { code: '+55', country: 'Brazil', flag: '🇧🇷' },
        { code: '+52', country: 'Mexico', flag: '🇲🇽' },
        { code: '+7', country: 'Russia', flag: '🇷🇺' },
        { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
        { code: '+66', country: 'Thailand', flag: '🇹🇭' },
        { code: '+63', country: 'Philippines', flag: '🇵🇭' },
        { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
        { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
        { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
        { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
        { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
        { code: '+977', country: 'Nepal', flag: '🇳🇵' },
        { code: '+974', country: 'Qatar', flag: '🇶🇦' },
        { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
        { code: '+968', country: 'Oman', flag: '🇴🇲' },
        { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
        { code: '+20', country: 'Egypt', flag: '🇪🇬' },
        { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
        { code: '+254', country: 'Kenya', flag: '🇰🇪' }
    ]

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+91',
        mobile: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({})
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    // Validation functions
    const validateName = (name) => {
        if (!name || name.trim().length === 0) {
            return 'Full name is required'
        }
        if (name.trim().length < 2) {
            return 'Name must be at least 2 characters'
        }
        if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
            return 'Name can only contain letters, spaces, hyphens and apostrophes'
        }
        return ''
    }

    const validateEmail = (email) => {
        if (!email || email.trim().length === 0) {
            return 'Email is required'
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email.trim())) {
            return 'Please enter a valid email address'
        }
        return ''
    }

    const validateMobile = (mobile) => {
        if (!mobile || mobile.trim().length === 0) {
            return 'Mobile number is required'
        }
        // Phone number: 6-14 digits (without country code)
        const cleanedMobile = mobile.replace(/[\s\-\(\)]/g, '')
        const mobileRegex = /^[0-9]{6,14}$/
        if (!mobileRegex.test(cleanedMobile)) {
            return 'Please enter a valid mobile number (6-14 digits)'
        }
        return ''
    }

    const validatePassword = (password) => {
        if (!password) {
            return 'Password is required'
        }
        if (password.length < 8) {
            return 'Password must be at least 8 characters'
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter'
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter'
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number'
        }
        return ''
    }

    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) {
            return 'Please confirm your password'
        }
        if (confirmPassword !== password) {
            return 'Passwords do not match'
        }
        return ''
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear field-specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        let fieldError = ''

        switch (name) {
            case 'name':
                fieldError = validateName(value)
                break
            case 'email':
                fieldError = validateEmail(value)
                break
            case 'mobile':
                fieldError = validateMobile(value)
                break
            case 'password':
                fieldError = validatePassword(value)
                break
            case 'confirmPassword':
                fieldError = validateConfirmPassword(value, formData.password)
                break
        }

        if (fieldError) {
            setErrors(prev => ({
                ...prev,
                [name]: fieldError
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validate all fields
        const nameError = validateName(formData.name)
        const emailError = validateEmail(formData.email)
        const mobileError = validateMobile(formData.mobile)
        const passwordError = validatePassword(formData.password)
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)

        const newErrors = {
            name: nameError,
            email: emailError,
            mobile: mobileError,
            password: passwordError,
            confirmPassword: confirmPasswordError
        }

        setErrors(newErrors)

        // Check if any errors exist
        if (Object.values(newErrors).some(err => err !== '')) {
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    mobile: formData.countryCode + formData.mobile.replace(/[\s\-\(\)]/g, ''),
                    password: formData.password
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            // Show success notification
            setSuccess(true)

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/auth/login?registered=true')
            }, 2000)

        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <h1>Create Account</h1>
                    <p className={styles.subtitle}>Join Marmex India today</p>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className={styles.success}>
                            🎉 Account created successfully! Redirecting to login...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="John Doe"
                                className={errors.name ? styles.inputError : ''}
                            />
                            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="you@example.com"
                                className={errors.email ? styles.inputError : ''}
                            />
                            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Mobile Number *</label>
                            <div className={styles.phoneInputGroup}>
                                <select
                                    name="countryCode"
                                    value={formData.countryCode}
                                    onChange={handleChange}
                                    className={styles.countryCodeSelect}
                                >
                                    {countryCodes.map(({ code, country, flag }) => (
                                        <option key={code} value={code}>
                                            {flag} {code} ({country})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="98765 43210"
                                    className={`${styles.phoneInput} ${errors.mobile ? styles.inputError : ''}`}
                                />
                            </div>
                            {errors.mobile && <span className={styles.fieldError}>{errors.mobile}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Create a strong password"
                                className={errors.password ? styles.inputError : ''}
                            />
                            <span className={styles.fieldHint}>Min 8 characters with uppercase, lowercase & number</span>
                            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Re-enter password"
                                className={errors.confirmPassword ? styles.inputError : ''}
                            />
                            {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading || success}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className={styles.switchLink}>
                        Already have an account? <Link href="/auth/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

