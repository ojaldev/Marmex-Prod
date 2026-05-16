import React from 'react';

export const metadata = {
  title: 'Terms of Service | MarmexIndia',
  description: 'Terms of Service and conditions for using MarmexIndia.',
};

export default function TermsOfService() {
  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>Terms of Service</h1>
      
      <div className="prose" style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
        
        <p>
          Welcome to MarmexIndia. By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations of India. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or software) on MarmexIndia's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. User Accounts</h2>
        <p>
          If you create an account on the Website, you are responsible for maintaining the security of your account, and you are fully responsible for all activities that occur under the account. You must immediately notify us of any unauthorized uses of your account or any other breaches of security.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. Products and Pricing</h2>
        <p>
          All products listed on the website are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>4. Payments</h2>
        <p>
          We use Razorpay as our secure payment gateway. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>5. Shipping and Delivery</h2>
        <p>
          Delivery timelines are estimates and are not guaranteed. We are not liable for any delays in shipping caused by factors beyond our control, including but not limited to courier delays, natural disasters, or logistical issues within India. 
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>6. Returns and Refunds</h2>
        <p>
          Please refer to our Returns Policy page for detailed information on how to process returns and claim refunds for damaged or incorrect items.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>7. Intellectual Property</h2>
        <p>
          The website and its original content, features, and functionality are owned by MarmexIndia and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>8. Governing Law</h2>
        <p>
          These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts located in India.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>9. Contact Information</h2>
        <p>
          Questions about the Terms of Service should be sent to us at support@marmexindia.com.
        </p>
      </div>
    </div>
  );
}
