'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Youtube, Mail, MapPin, Phone, CreditCard, Shield, Truck, Award } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Trust Bar */}
      <motion.div
        className={styles.trustBar}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container">
          <div className={styles.trustGrid}>
            <motion.div className={styles.trustItem} variants={fadeInUp}>
              <Truck size={28} />
              <div>
                <h4>Free Shipping</h4>
                <p>On orders above ₹2,999</p>
              </div>
            </motion.div>
            <motion.div className={styles.trustItem} variants={fadeInUp}>
              <Shield size={28} />
              <div>
                <h4>Secure Payment</h4>
                <p>100% secure checkout</p>
              </div>
            </motion.div>
            <motion.div className={styles.trustItem} variants={fadeInUp}>
              <Award size={28} />
              <div>
                <h4>Premium Quality</h4>
                <p>Handcrafted excellence</p>
              </div>
            </motion.div>
            <motion.div className={styles.trustItem} variants={fadeInUp}>
              <CreditCard size={28} />
              <div>
                <h4>Easy Returns</h4>
                <p>30-day return policy</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Footer */}
      <div className={styles.mainFooter}>
        <div className="container">
          <div className={styles.footerGrid}>
            <motion.div
              className={styles.footerCol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className={styles.footerTitle}>Marmex India</h3>
              <p className={styles.footerDesc}>
                Exquisite handcrafted marble and stone products that blend traditional craftsmanship with contemporary design. Each piece tells a story of heritage and artistry.
              </p>
              <div className={styles.socialLinks}>
                <a href="https://instagram.com/marmexindia" target="_blank" rel="noopener" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="https://youtube.com/@stoneartwala" target="_blank" rel="noopener" aria-label="YouTube">
                  <Youtube size={20} />
                </a>
                <a href="mailto:Marmexindia@gmail.com" aria-label="Email">
                  <Mail size={20} />
                </a>
              </div>
            </motion.div>

            <motion.div
              className={styles.footerCol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className={styles.footerHeading}>Quick Links</h4>
              <ul className={styles.footerLinks}>
                <li><Link href="/products">All Products</Link></li>
                <li><Link href="/projects">Portfolio</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/custom">Custom Orders</Link></li>
              </ul>
            </motion.div>

            <motion.div
              className={styles.footerCol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className={styles.footerHeading}>Categories</h4>
              <ul className={styles.footerLinks}>
                <li><Link href="/products?category=sculptures">Sculptures</Link></li>
                <li><Link href="/products?category=carvings">Stone Carvings</Link></li>
                <li><Link href="/products?category=dining">Dining Décor</Link></li>
                <li><Link href="/products?category=gifts">Personalized Gifts</Link></li>
                <li><Link href="/products?category=games">Marble Games</Link></li>
              </ul>
            </motion.div>

            <motion.div
              className={styles.footerCol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className={styles.footerHeading}>Contact Info</h4>
              <ul className={styles.contactInfo}>
                <li>
                  <Phone size={16} />
                  <a href="tel:+919582134493">+91 95821 34493</a>
                </li>
                <li>
                  <Mail size={16} />
                  <a href="mailto:Marmexindia@gmail.com">Marmexindia@gmail.com</a>
                </li>
                <li>
                  <MapPin size={16} />
                  <span>Jaipur, Rajasthan, India</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomFooter}>
        <div className="container">
          <div className={styles.bottomContent}>
            <p>&copy; {new Date().getFullYear()} Marmex India. All rights reserved.</p>
            <div className={styles.legalLinks}>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-of-service">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
