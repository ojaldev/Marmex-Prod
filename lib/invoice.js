import PDFDocument from 'pdfkit'

const COMPANY = {
    name: 'MARMEX INDIA',
    tagline: 'Premium Marble Art & Sculptures',
    address: 'Noida, India',
    phone: '+91 95821 34493',
    email: 'Marmexindia@gmail.com',
    gstin: process.env.COMPANY_GSTIN || ''
}

const PAGE_WIDTH = 595.28  // A4 width in points
const PAGE_HEIGHT = 841.89 // A4 height in points
const MARGIN = 50
const SAFE_BOTTOM = PAGE_HEIGHT - MARGIN - 60 // Reserve space for footer

function addPageIfNeeded(doc, yPos) {
    if (yPos > SAFE_BOTTOM) {
        doc.addPage()
        return MARGIN + 20
    }
    return yPos
}

/**
 * Generate invoice PDF for an order
 */
export async function generateInvoicePDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: MARGIN, size: 'A4' })
            const buffers = []

            doc.on('data', buffers.push.bind(buffers))
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers)
                resolve(pdfData)
            })

            // ── Company Header ──
            doc
                .fontSize(20)
                .fillColor('#D4A574')
                .text(COMPANY.name, MARGIN, 50)
                .fontSize(10)
                .fillColor('#666')
                .text(COMPANY.tagline, MARGIN, 75)

            if (COMPANY.gstin) {
                doc.text(`GSTIN: ${COMPANY.gstin}`, MARGIN, 90)
                doc.text(`Address: ${COMPANY.address}`, MARGIN, 105)
            } else {
                doc.text(`Address: ${COMPANY.address}`, MARGIN, 90)
                doc.text(`Phone: ${COMPANY.phone} | Email: ${COMPANY.email}`, MARGIN, 105)
            }

            // ── Invoice Title ──
            doc
                .fontSize(24)
                .fillColor('#000')
                .text('TAX INVOICE', 400, 50, { align: 'right' })
                .fontSize(10)
                .fillColor('#666')
                .text(`Invoice No: ${order.orderNumber || 'N/A'}`, 400, 80, { align: 'right' })
                .text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}`, 400, 95, { align: 'right' })

            // ── Horizontal line ──
            doc
                .strokeColor('#D4A574')
                .lineWidth(2)
                .moveTo(MARGIN, 130)
                .lineTo(PAGE_WIDTH - MARGIN, 130)
                .stroke()

            // ── Billing & Shipping Info ──
            let yPos = 150

            const addr = order.shippingAddress || {}
            doc
                .fontSize(12)
                .fillColor('#000')
                .text('Bill To:', MARGIN, yPos)

            yPos += 20
            doc
                .fontSize(10)
                .fillColor('#666')
                .text(addr.name || '—', MARGIN, yPos)
            yPos += 15
            doc.text(addr.phone || '—', MARGIN, yPos)
            yPos += 15
            doc.text(addr.line1 || '—', MARGIN, yPos)
            yPos += 15
            if (addr.line2) {
                doc.text(addr.line2, MARGIN, yPos)
                yPos += 15
            }
            doc.text(`${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}`, MARGIN, yPos)

            // ── GST Details (if applicable) ──
            if (order.gstInvoice?.needed) {
                yPos = 150
                doc
                    .fontSize(12)
                    .fillColor('#000')
                    .text('GST Details:', 350, yPos)
                yPos += 20
                doc
                    .fontSize(10)
                    .fillColor('#666')
                    .text(order.gstInvoice.companyName || '—', 350, yPos)
                yPos += 15
                doc.text(`GSTIN: ${order.gstInvoice.gstin || '—'}`, 350, yPos)
            }

            // ── Items Table ──
            yPos += 40
            yPos = addPageIfNeeded(doc, yPos)

            doc
                .strokeColor('#D4A574')
                .lineWidth(1)
                .moveTo(MARGIN, yPos)
                .lineTo(PAGE_WIDTH - MARGIN, yPos)
                .stroke()

            yPos += 15

            // Table Headers
            doc
                .fontSize(10)
                .fillColor('#000')
                .font('Helvetica-Bold')
                .text('Item', MARGIN, yPos)
                .text('Qty', 350, yPos)
                .text('Rate', 400, yPos)
                .text('Discount', 450, yPos)
                .text('Amount', 500, yPos, { align: 'right' })

            yPos += 10
            doc
                .strokeColor('#ccc')
                .lineWidth(0.5)
                .moveTo(MARGIN, yPos)
                .lineTo(PAGE_WIDTH - MARGIN, yPos)
                .stroke()

            yPos += 15

            // Table Items
            doc.font('Helvetica')
            const items = order.items || []
            items.forEach(item => {
                yPos = addPageIfNeeded(doc, yPos)

                const price = Number(item.price) || 0
                const discount = Number(item.discount) || 0
                const qty = Number(item.quantity) || 1
                const itemTotal = (price - discount) * qty

                doc
                    .fillColor('#666')
                    .text(String(item.name || '—').substring(0, 40), MARGIN, yPos, { width: 280 })
                    .text(String(qty), 350, yPos)
                    .text(`₹${price.toLocaleString()}`, 400, yPos)
                    .text(discount > 0 ? `₹${discount.toLocaleString()}` : '—', 450, yPos)
                    .fillColor('#000')
                    .text(`₹${itemTotal.toLocaleString()}`, 500, yPos, { align: 'right' })

                yPos += 25
            })

            // ── Subtotals ──
            yPos += 10
            yPos = addPageIfNeeded(doc, yPos)
            doc
                .strokeColor('#ccc')
                .lineWidth(0.5)
                .moveTo(350, yPos)
                .lineTo(PAGE_WIDTH - MARGIN, yPos)
                .stroke()

            yPos += 15

            const subtotal = Number(order.subtotal) || 0
            const orderDiscount = Number(order.discount) || 0
            const shipping = Number(order.shipping) || 0
            const tax = Number(order.tax) || 0
            const total = Number(order.total) || 0

            doc
                .fontSize(10)
                .fillColor('#666')
                .text('Subtotal:', 400, yPos)
                .fillColor('#000')
                .text(`₹${subtotal.toLocaleString()}`, 500, yPos, { align: 'right' })

            if (orderDiscount > 0) {
                yPos += 20
                doc
                    .fillColor('#666')
                    .text('Discount:', 400, yPos)
                    .fillColor('#10b981')
                    .text(`-₹${orderDiscount.toLocaleString()}`, 500, yPos, { align: 'right' })
            }

            yPos += 20
            doc
                .fillColor('#666')
                .text('Shipping:', 400, yPos)
                .fillColor('#000')
                .text(shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`, 500, yPos, { align: 'right' })

            // GST Breakdown
            const cgst = tax / 2
            const sgst = tax / 2
            const taxRate = subtotal > 0 ? ((tax / subtotal) * 100).toFixed(1) : '0'
            const halfRate = (Number(taxRate) / 2).toFixed(1)

            yPos += 20
            doc
                .fillColor('#666')
                .text(`CGST (${halfRate}%):`, 400, yPos)
                .fillColor('#000')
                .text(`₹${cgst.toFixed(2)}`, 500, yPos, { align: 'right' })

            yPos += 20
            doc
                .fillColor('#666')
                .text(`SGST (${halfRate}%):`, 400, yPos)
                .fillColor('#000')
                .text(`₹${sgst.toFixed(2)}`, 500, yPos, { align: 'right' })

            yPos += 15
            doc
                .strokeColor('#D4A574')
                .lineWidth(2)
                .moveTo(350, yPos)
                .lineTo(PAGE_WIDTH - MARGIN, yPos)
                .stroke()

            yPos += 15

            // Total
            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#D4A574')
                .text('Total Amount:', 400, yPos)
                .text(`₹${total.toLocaleString()}`, 500, yPos, { align: 'right' })

            // ── Payment Info ──
            yPos += 40
            yPos = addPageIfNeeded(doc, yPos)
            doc
                .fontSize(10)
                .font('Helvetica')
                .fillColor('#666')
                .text(`Payment Method: ${(order.payment?.method || '—').toUpperCase()}`, MARGIN, yPos)

            yPos += 15
            doc.text(`Payment Status: ${(order.payment?.status || '—').toUpperCase()}`, MARGIN, yPos)

            if (order.payment?.transactionId) {
                yPos += 15
                doc.text(`Transaction ID: ${order.payment.transactionId}`, MARGIN, yPos)
            }

            // ── Footer ──
            const footerY = Math.min(yPos + 40, PAGE_HEIGHT - MARGIN - 30)
            doc
                .fontSize(8)
                .fillColor('#999')
                .text('This is a computer-generated invoice and does not require a signature.', MARGIN, footerY, { align: 'center', width: PAGE_WIDTH - MARGIN * 2 })
                .text('Thank you for your business!', MARGIN, footerY + 15, { align: 'center', width: PAGE_WIDTH - MARGIN * 2 })

            doc.end()
        } catch (error) {
            reject(error)
        }
    })
}
