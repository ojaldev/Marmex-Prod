import { Palette, MessageSquare, CheckCircle, Clock, Sparkles } from 'lucide-react'
import styles from './custom.module.css'

export default function CustomOrdersPage() {
    return (
        <main className={styles.customPage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1>Custom Orders</h1>
                        <p className={styles.subtitle}>
                            Bring your vision to life with our bespoke marble craftsmanship
                        </p>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* How It Works */}
                <section className={styles.howItWorks}>
                    <h2>How It Works</h2>
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <MessageSquare size={32} />
                            </div>
                            <h3>1. Share Your Vision</h3>
                            <p>Tell us about your idea, preferences, and requirements through our inquiry form</p>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <Palette size={32} />
                            </div>
                            <h3>2. Design & Quote</h3>
                            <p>Our artisans will create a design mockup and provide you with a detailed quote</p>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <CheckCircle size={32} />
                            </div>
                            <h3>3. Approval</h3>
                            <p>Review and approve the design, make any adjustments needed</p>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <Sparkles size={32} />
                            </div>
                            <h3>4. Crafting</h3>
                            <p>Our master craftsmen bring your design to life with premium marble</p>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <Clock size={32} />
                            </div>
                            <h3>5. Delivery</h3>
                            <p>Your custom piece is carefully packaged and delivered to your doorstep</p>
                        </div>
                    </div>
                </section>

                {/* Popular Custom Items */}
                <section className={styles.popularItems}>
                    <h2>Popular Custom Orders</h2>
                    <div className={styles.itemsGrid}>
                        <div className={styles.item}>
                            <div className={styles.itemImage}>🏆</div>
                            <h3>Corporate Awards</h3>
                            <p>Elegant marble trophies and plaques with custom engraving</p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.itemImage}>🎁</div>
                            <h3>Wedding Gifts</h3>
                            <p>Personalized marble keepsakes for special occasions</p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.itemImage}>🏠</div>
                            <h3>Home Décor</h3>
                            <p>Custom sculptures and art pieces for your space</p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.itemImage}>💍</div>
                            <h3>Jewelry Boxes</h3>
                            <p>Handcrafted marble boxes with intricate designs</p>
                        </div>
                    </div>
                </section>

                {/* Inquiry Form */}
                <section className={styles.inquiryForm}>
                    <div className={styles.formCard}>
                        <h2>Start Your Custom Order</h2>
                        <p>Fill out the form below and we&apos;ll get back to you within 24 hours</p>

                        <form className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.inputWrapper}>
                                    <input type="text" required placeholder=" " />
                                    <label>Your Name *</label>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <input type="email" required placeholder=" " />
                                    <label>Email Address *</label>
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.inputWrapper}>
                                    <input type="tel" required placeholder=" " />
                                    <label>Phone Number *</label>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <select required>
                                        <option value="">Select Category</option>
                                        <option value="sculpture">Sculpture</option>
                                        <option value="gift">Gift Item</option>
                                        <option value="decor">Home Décor</option>
                                        <option value="award">Award/Trophy</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <label>Category *</label>
                                </div>
                            </div>

                            <div className={styles.inputWrapper}>
                                <textarea rows="6" required placeholder=" "></textarea>
                                <label>Describe Your Vision *</label>
                            </div>

                            <div className={styles.inputWrapper}>
                                <input type="text" placeholder=" " />
                                <label>Budget Range (Optional)</label>
                            </div>

                            <button type="submit" className="btn btn-primary">
                                Submit Inquiry
                            </button>
                        </form>
                    </div>

                    <div className={styles.infoCard}>
                        <h3>Why Choose Custom?</h3>
                        <ul>
                            <li><CheckCircle size={20} /> Unique, one-of-a-kind pieces</li>
                            <li><CheckCircle size={20} /> Premium quality marble</li>
                            <li><CheckCircle size={20} /> Expert craftsmanship</li>
                            <li><CheckCircle size={20} /> Personalized designs</li>
                            <li><CheckCircle size={20} /> Perfect for gifts & awards</li>
                        </ul>

                        <div className={styles.contact}>
                            <h4>Questions?</h4>
                            <p>
                                <strong>Email:</strong> custom@marmexindia.com<br />
                                <strong>Phone:</strong> +91 1234567890<br />
                                <strong>Hours:</strong> Mon-Sat, 9AM-6PM
                            </p>
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className={styles.timeline}>
                    <h2>Typical Timeline</h2>
                    <div className={styles.timelineContent}>
                        <div className={styles.timelineItem}>
                            <strong>Initial Design:</strong> 3-5 business days
                        </div>
                        <div className={styles.timelineItem}>
                            <strong>Approval & Revisions:</strong> 1-3 business days
                        </div>
                        <div className={styles.timelineItem}>
                            <strong>Production:</strong> 2-4 weeks (depending on complexity)
                        </div>
                        <div className={styles.timelineItem}>
                            <strong>Delivery:</strong> 5-7 business days
                        </div>
                    </div>
                    <p className={styles.timelineNote}>
                        *Timeline may vary based on design complexity and current order volume
                    </p>
                </section>
            </div>
        </main>
    )
}
