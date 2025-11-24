'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import styles from './GSTInvoice.module.css'

export default function GSTInvoice({ onUpdate, gstData }) {
    const [needsGST, setNeedsGST] = useState(gstData?.needsGST || false)
    const [gstDetails, setGSTDetails] = useState({
        companyName: gstData?.companyName || '',
        gstin: gstData?.gstin || '',
        companyAddress: gstData?.companyAddress || ''
    })
    const [errors, setErrors] = useState({})

    const validateGSTIN = (gstin) => {
        // GSTIN format: 22AAAAA0000A1Z5
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
        return gstinRegex.test(gstin)
    }

    const handleToggle = (checked) => {
        setNeedsGST(checked)
        if (!checked) {
            setGSTDetails({ companyName: '', gstin: '', companyAddress: '' })
            setErrors({})
            onUpdate({ needsGST: false })
        } else {
            onUpdate({ needsGST: true, ...gstDetails })
        }
    }

    const handleChange = (field, value) => {
        const newDetails = { ...gstDetails, [field]: value }
        setGSTDetails(newDetails)

        // Validate GSTIN
        if (field === 'gstin') {
            const upperGSTIN = value.toUpperCase()
            newDetails.gstin = upperGSTIN

            if (upperGSTIN && !validateGSTIN(upperGSTIN)) {
                setErrors(prev => ({ ...prev, gstin: 'Invalid GSTIN format' }))
            } else {
                setErrors(prev => ({ ...prev, gstin: null }))
            }
        }

        if (needsGST) {
            onUpdate({ needsGST: true, ...newDetails })
        }
    }

    return (
        <div className={styles.gstInvoice}>
            <label className={styles.gstToggle}>
                <input
                    type="checkbox"
                    checked={needsGST}
                    onChange={(e) => handleToggle(e.target.checked)}
                />
                <span className={styles.checkbox} />
                <div className={styles.gstLabel}>
                    <FileText size={20} />
                    <div>
                        <strong>I need a GST Invoice</strong>
                        <small>For business purchases</small>
                    </div>
                </div>
            </label>

            {needsGST && (
                <div className={styles.gstForm}>
                    <div className={styles.formGroup}>
                        <label>Company Name *</label>
                        <input
                            type="text"
                            value={gstDetails.companyName}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                            placeholder="Enter registered company name"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>GSTIN *</label>
                        <input
                            type="text"
                            value={gstDetails.gstin}
                            onChange={(e) => handleChange('gstin', e.target.value)}
                            placeholder="Enter 15-digit GSTIN"
                            maxLength={15}
                            required
                        />
                        {errors.gstin && <span className={styles.error}>{errors.gstin}</span>}
                        <small>Format: 22AAAAA0000A1Z5</small>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Company Address *</label>
                        <textarea
                            value={gstDetails.companyAddress}
                            onChange={(e) => handleChange('companyAddress', e.target.value)}
                            placeholder="Enter registered company address"
                            rows={3}
                            required
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
