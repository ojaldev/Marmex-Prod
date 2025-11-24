import Link from 'next/link'
import { Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.mainFooter}>
                <div className="container">
                    <div className={styles.footerGrid}>
                        <div className={styles.footerCol}>
                            <h3 className={styles.footerTitle}>Marmex India</h3>
                            <p className={styles.footerDesc}>
                                Exquisite handcrafted marble and stone products that blend traditional craftsmanship with contemporary design.
                            </p>
                            <div className={styles.socialLinks}>
                                <a href="https://instagram.com/marmexindia" target="_blank" rel="noopener" aria-label="Instagram">
                                    <Instagram size={20} />
                                </a>
                                <a href="https://youtube.com/@stoneartwala" target="_blank" rel="noopener" aria-label="YouTube">
                                    <Youtube size={20} />
                                </a>
                                <a href="mailto:contact@marmexindia.com" aria-label="Email">
                                    <Mail size={20} />
                                </a>
                            </div>
                        </div>

                        <div className={styles.footerCol}>
                            <h4 className={styles.footerHeading}>Quick Links</h4>
                            <ul className={styles.footerLinks}>
                                <li><Link href="/products">All Products</Link></li>
                                <li><Link href="/projects">Portfolio</Link></li>
                                <li><Link href="/about">About Us</Link></li>
                                <li><Link href="/contact">Contact</Link></li>
                                <li><Link href="/custom-orders">Custom Orders</Link></li>
                            </ul>
                        </div>

                        <div className={styles.footerCol}>
                            <h4 className={styles.footerHeading}>Categories</h4>
                            <ul className={styles.footerLinks}>
                                <li><Link href="/products?category=sculptures">Sculptures</Link></li>
                                <li><Link href="/products?category=carvings">Stone Carvings</Link></li>
                                <li><Link href="/products?category=dining">Dining Décor</Link></li>
                                <li><Link href="/products?category=gifts">Personalized Gifts</Link></li>
                                <li><Link href="/products?category=games">Marble Games</Link></li>
                            </ul>
                        </div>

                        <div className={styles.footerCol}>
                            <h4 className={styles.footerHeading}>Contact Info</h4>
                            <ul className={styles.contactInfo}>
                                <li>
                                    <Phone size={16} />
                                    <span>+91 XXXXX XXXXX</span>
                                </li>
                                <li>
                                    <Mail size={16} />
                                    <span>contact@marmexindia.com</span>
                                </li>
                                <li>
                                    <MapPin size={16} />
                                    <span>India</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.bottomFooter}>
                <div className="container">
                    <div className={styles.bottomContent}>
                        <p>&copy; {new Date().getFullYear()} Marmex India. All rights reserved.</p>
                        <div className={styles.legalLinks}>
                            <Link href="/privacy">Privacy Policy</Link>
                            <Link href="/terms">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
