import { Mail, Phone, MapPin, Instagram, Youtube, Send } from 'lucide-react'
import styles from './contact.module.css'

export default function ContactPage() {
    return (
        <main className={styles.contactPage}>
            <div className={styles.hero}>
                <div className="container">
                    <h1>Get In Touch</h1>
                    <p>We&apos;d love to hear from you about your stone art needs</p>
                </div>
            </div>

            <div className="container section">
                <div className={styles.layout}>
                    <div className={styles.contactInfo}>
                        <h2>Contact Information</h2>
                        <p className={styles.intro}>
                            Have a question or want to discuss a custom project? Reach out to us through any of the channels below.
                        </p>

                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <Phone size={24} color="var(--color-secondary)" />
                                <div>
                                    <h4>Phone</h4>
                                    <p>+91 XXXXX XXXXX</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <Mail size={24} color="var(--color-secondary)" />
                                <div>
                                    <h4>Email</h4>
                                    <p>contact@marmexindia.com</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <MapPin size={24} color="var(--color-secondary)" />
                                <div>
                                    <h4>Location</h4>
                                    <p>India</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.social}>
                            <h4>Follow Us</h4>
                            <div className={styles.socialLinks}>
                                <a href="https://instagram.com/marmexindia" target="_blank" rel="noopener" className={styles.socialBtn}>
                                    <Instagram size={20} />
                                    Instagram
                                </a>
                                <a href="https://youtube.com/@stoneartwala" target="_blank" rel="noopener" className={styles.socialBtn}>
                                    <Youtube size={20} />
                                    YouTube
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formContainer}>
                        <h2>Send Us a Message</h2>
                        <form className={styles.form}>
                            <div className={styles.formGrid}>
                                <div className={styles.field}>
                                    <label>Your Name *</label>
                                    <input type="text" required placeholder="John Doe" />
                                </div>

                                <div className={styles.field}>
                                    <label>Email Address *</label>
                                    <input type="email" required placeholder="john@example.com" />
                                </div>

                                <div className={styles.field}>
                                    <label>Phone Number</label>
                                    <input type="tel" placeholder="+91 XXXXX XXXXX" />
                                </div>

                                <div className={styles.field}>
                                    <label>Subject *</label>
                                    <input type="text" required placeholder="Product Inquiry" />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Message *</label>
                                <textarea required rows="5" placeholder="Tell us about your requirements..."></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary">
                                <Send size={18} />
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>

                <div className={styles.bulkOrder}>
                    <h2>Bulk Orders & Custom Projects</h2>
                    <p>
                        Looking for bulk orders or custom marble installations? We specialize in large-scale projects
                        for hotels, restaurants, residential complexes, and commercial spaces. Contact us for a personalized quote.
                    </p>
                    <a href="mailto:contact@marmexindia.com" className="btn btn-secondary">Request Bulk Quote</a>
                </div>
            </div>
        </main>
    )
}
