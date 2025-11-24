'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Camera } from 'lucide-react'
import styles from './profile.module.css'

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: ''
    })
    const [photoPreview, setPhotoPreview] = useState(null)

    // Fetch user profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile')
                if (res.ok) {
                    const data = await res.json()
                    setFormData({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        mobile: data.user.mobile || ''
                    })
                    setPhotoPreview(data.user.photo)
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error)
            }
        }

        if (session) {
            fetchProfile()
        }
    }, [session])

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    photo: photoPreview
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            // Update session with Cloudinary URL from backend response
            if (data.user.photo) {
                await update({
                    name: formData.name,
                    image: data.user.photo
                })
                // Update preview with Cloudinary URL
                setPhotoPreview(data.user.photo)
            } else {
                await update({ name: formData.name })
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (error) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.profilePage}>
            <div className="container">
                <h1>My Profile</h1>

                {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.content}>
                    {/* Photo Upload */}
                    <div className={styles.photoSection}>
                        <div className={styles.photoWrapper}>
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" />
                            ) : (
                                <div className={styles.photoPlaceholder}>
                                    {session?.user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label className={styles.photoUpload}>
                                <Camera size={20} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    hidden
                                />
                            </label>
                        </div>
                        <p>Click camera icon to change photo</p>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className={styles.disabled}
                            />
                            <small>Email cannot be changed</small>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
