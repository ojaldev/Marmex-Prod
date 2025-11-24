import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"Marmex India" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    })

    console.log('Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Email sending error:', error)
    throw new Error('Failed to send email')
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email, name) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a1a1a, #2a2a2a); color: #D4A574; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #D4A574; color: #1a1a1a; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Marmex India</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for creating an account with Marmex India. We're thrilled to have you as part of our community.</p>
            <p>Explore our exquisite collection of handcrafted marble art, sculptures, and luxury gifts.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">Start Shopping</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Marmex India. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Welcome to Marmex India',
    html
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetToken) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a1a1a, #2a2a2a); color: #D4A574; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #D4A574; color: #1a1a1a; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>You requested to reset your password for your Marmex India account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </div>
            <p>For security reasons, we cannot show your current password.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Marmex India. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `


  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Marmex India',
    html
  })
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(email, order) {
  const itemsHtml = order.items.map(item => `
    <div style="display: flex; gap: 15px; padding: 15px; background: white; margin-bottom: 10px; border-radius: 5px; border: 1px solid #e5e5e5;">
      ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">` : ''}
      <div style="flex: 1;">
        <strong style="display: block; margin-bottom: 5px;">${item.name}</strong>
        <p style="margin: 3px 0; color: #666; font-size: 14px;">Quantity: ${item.quantity}</p>
        <p style="margin: 3px 0; color: #D4A574; font-weight: bold;">₹${item.price.toLocaleString()}</p>
      </div>
    </div>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #1a1a1a, #2a2a2a); color: #D4A574; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0 0 10px 0; font-size: 28px; }
          .order-number { font-size: 24px; font-weight: bold; color: #D4A574; margin: 10px 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1a1a1a; border-bottom: 2px solid #D4A574; padding-bottom: 10px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #666; }
          .info-value { font-weight: bold; color: #1a1a1a; }
          .total-row { background: #f9f9f9; padding: 15px; margin-top: 15px; border-radius: 5px; }
          .total-row .info-value { color: #D4A574; font-size: 20px; }
          .button { display: inline-block; padding: 12px 30px; background: #D4A574; color: #1a1a1a; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 30px; color: #666; font-size: 12px; background: #f9f9f9; }
          .address { line-height: 1.8; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p class="order-number">#${order.orderNumber}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Thank you for your purchase at Marmex India</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">📦 Order Items</div>
              ${itemsHtml}
            </div>

            <div class="section">
              <div class="section-title">💰 Order Summary</div>
              <div class="info-row">
                <span class="info-label">Subtotal:</span>
                <span class="info-value">₹${order.subtotal.toLocaleString()}</span>
              </div>
              ${order.discount > 0 ? `
                <div class="info-row">
                  <span class="info-label">Discount:</span>
                  <span class="info-value" style="color: #10b981;">-₹${order.discount.toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Shipping:</span>
                <span class="info-value">${order.shipping === 0 ? 'FREE' : '₹' + order.shipping.toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tax (GST 18%):</span>
                <span class="info-value">₹${order.tax.toLocaleString()}</span>
              </div>
              <div class="total-row">
                <div class="info-row">
                  <span class="info-label" style="font-size: 18px; font-weight: bold;">Total:</span>
                  <span class="info-value">₹${order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">📍 Shipping Address</div>
              <div class="address">
                <strong>${order.shippingAddress.name}</strong><br>
                ${order.shippingAddress.phone}<br>
                ${order.shippingAddress.line1}<br>
                ${order.shippingAddress.line2 ? order.shippingAddress.line2 + '<br>' : ''}
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}
              </div>
            </div>

            <div class="section">
              <div class="section-title">💳 Payment Information</div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${order.payment.method.toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Status:</span>
                <span class="info-value" style="color: ${order.payment.status === 'completed' ? '#10b981' : '#f59e0b'};">${order.payment.status.toUpperCase()}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order._id}" class="button">
                Track Your Order
              </a>
            </div>

            <p style="text-align: center; color: #666; margin-top: 20px;">
              We'll send you another email when your order ships. If you have any questions, feel free to contact our support team.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Marmex India</strong></p>
            <p>Premium Marble Art & Sculptures</p>
            <p>&copy; ${new Date().getFullYear()} Marmex India. All rights reserved.</p>
            <p style="margin-top: 15px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #D4A574; text-decoration: none;">Visit Our Store</a> | 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: #D4A574; text-decoration: none;">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `Order Confirmation #${order.orderNumber} - Marmex India`,
    html
  })
}
