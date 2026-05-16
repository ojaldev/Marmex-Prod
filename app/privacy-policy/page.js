import React from 'react';

export const metadata = {
  title: 'Privacy Policy | MarmexIndia',
  description: 'Privacy Policy for MarmexIndia e-commerce platform.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>Privacy Policy</h1>
      
      <div className="prose" style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
        
        <p>
          Welcome to MarmexIndia. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our website. We are committed to protecting your privacy in accordance with the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 of India.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Personal Information We Collect</h2>
        <p>
          When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the site, and information about how you interact with the site.
        </p>
        <p>
          When you make a purchase or attempt to make a purchase through the site, we collect certain information from you, including your name, billing address, shipping address, payment information (processed securely through Razorpay), email address, and phone number.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. How Do We Use Your Personal Information?</h2>
        <p>
          We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
        </p>
        <p>Additionally, we use this Order Information to:</p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>Communicate with you;</li>
          <li>Screen our orders for potential risk or fraud; and</li>
          <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
        </ul>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. Sharing Your Personal Information</h2>
        <p>
          We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Razorpay to process your payments securely. We also share information with our shipping and logistics partners to deliver your orders across India.
        </p>
        <p>
          Finally, we may also share your Personal Information to comply with applicable laws and regulations in India, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures designed to protect your personal information against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access. However, please be aware that no method of transmission over the internet, or method of electronic storage, is 100% secure.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>5. Your Rights</h2>
        <p>
          If you are a resident of India, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>6. Changes</h2>
        <p>
          We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>7. Contact Us</h2>
        <p>
          For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact our Grievance Officer by e-mail at privacy@marmexindia.com or by mail using the details provided on our Contact page.
        </p>
      </div>
    </div>
  );
}
