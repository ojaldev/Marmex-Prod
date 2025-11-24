import { Award, Users, Heart, Sparkles } from 'lucide-react'
import styles from './about.module.css'

export default function AboutPage() {
    return (
        <main className={styles.aboutPage}>
            <div className={styles.hero}>
                <div className="container">
                    <h1>About Marmex India</h1>
                    <p>Crafting Timeless Elegance in Stone Since 2000</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    <div className={styles.story}>
                        <h2>Our Story</h2>
                        <p>
                            Marmex India is a premier destination for exquisite handcrafted marble and stone art.
                            With over two decades of experience, we have been transforming raw stone into timeless masterpieces
                            that grace homes, offices, and public spaces across India and beyond.
                        </p>
                        <p>
                            Our journey began with a simple vision: to preserve and promote the ancient art of stone carving
                            while infusing it with contemporary design sensibilities. Today, we are proud to be recognized as
                            one of India&apos;s leading stone art studios, known for our exceptional craftsmanship, attention to detail,
                            and commitment to quality.
                        </p>
                    </div>
                </div>
            </section>

            <section className={`section ${styles.valuesSection}`}>
                <div className="container">
                    <h2 className="section-title">Our Values</h2>
                    <div className={styles.values}>
                        <div className={styles.valueCard}>
                            <Award size={48} color="var(--color-secondary)" />
                            <h3>Quality Craftsmanship</h3>
                            <p>Every piece is meticulously handcrafted by skilled artisans who have mastered their craft over decades.</p>
                        </div>

                        <div className={styles.valueCard}>
                            <Sparkles size={48} color="var(--color-secondary)" />
                            <h3>Timeless Design</h3>
                            <p>We blend traditional techniques with contemporary aesthetics to create pieces that never go out of style.</p>
                        </div>

                        <div className={styles.valueCard}>
                            <Users size={48} color="var(--color-secondary)" />
                            <h3>Customer First</h3>
                            <p>Your satisfaction is our priority. We work closely with you to bring your vision to life.</p>
                        </div>

                        <div className={styles.valueCard}>
                            <Heart size={48} color="var(--color-secondary)" />
                            <h3>Passion & Integrity</h3>
                            <p>We pour our heart into every creation and maintain the highest standards of business ethics.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className={styles.offerings}>
                        <h2>What We Offer</h2>
                        <div className={styles.offeringsGrid}>
                            <div className={styles.offering}>
                                <h3>Custom Designs</h3>
                                <p>Bring your unique vision to life with our custom stone art services. We work with you from concept to completion.</p>
                            </div>
                            <div className={styles.offering}>
                                <h3>Premium Materials</h3>
                                <p>We source the finest marble, granite, and semi-precious stones from around the world to ensure superior quality.</p>
                            </div>
                            <div className={styles.offering}>
                                <h3>Diverse Collection</h3>
                                <p>From sculptures to dining décor, wall art to personalized gifts - explore our extensive range of stone art.</p>
                            </div>
                            <div className={styles.offering}>
                                <h3>Installation Services</h3>
                                <p>Our expert team provides professional installation services to ensure your pieces are displayed perfectly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
