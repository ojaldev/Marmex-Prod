import styles from './TrustBar.module.css'
import { Star, Truck, Shield, RefreshCw } from 'lucide-react'

export default function TrustBar() {
    const features = [
        {
            icon: Star,
            text: '5000+ Happy Customers',
            subtext: '4.8★ Rating'
        },
        {
            icon: Truck,
            text: 'Free Shipping',
            subtext: 'On orders above ₹2,999'
        },
        {
            icon: Shield,
            text: 'Secure Payment',
            subtext: '100% Safe & Encrypted'
        },
        {
            icon: RefreshCw,
            text: '30-Day Returns',
            subtext: 'Hassle-free refunds'
        }
    ]

    return (
        <div className={styles.trustBar}>
            <div className="container">
                <div className={styles.features}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.feature}>
                            <div className={styles.iconWrapper}>
                                <feature.icon size={24} className={styles.icon} />
                            </div>
                            <div className={styles.content}>
                                <p className={styles.text}>{feature.text}</p>
                                <p className={styles.subtext}>{feature.subtext}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
