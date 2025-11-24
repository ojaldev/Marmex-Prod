import PDFDocument from 'pdfkit'

/**
 * Generate invoice PDF for an order
 */
export async function generateInvoicePDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' })
            const buffers = []

            doc.on('data', buffers.push.bind(buffers))
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers)
                resolve(pdfData)
            })

            // Company Header
            doc
                .fontSize(20)
                .fillColor('#D4A574')
                .text('MARMEX INDIA', 50, 50)
                .fontSize(10)
                .fillColor('#666')
                .text('Premium Marble Art & Sculptures', 50, 75)
                .text('GST: 22AAAAA0000A1Z5', 50, 90)
                .text('Address: Mumbai, Maharashtra', 50, 105)

            // Invoice Title
            doc
                .fontSize(24)
                .fillColor('#000')
                .text('TAX INVOICE', 400, 50, { align: 'right' })
                .fontSize(10)
                .fillColor('#666')
                .text(`Invoice No: ${order.orderNumber}`, 400, 80, { align: 'right' })
                .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 95, { align: 'right' })

            // Horizontal line
            doc
                .strokeColor('#D4A574')
                .lineWidth(2)
                .moveTo(50, 130)
                .lineTo(550, 130)
                .stroke()

            // Billing & Shipping Info
            let yPos = 150

            doc
                .fontSize(12)
                .fillColor('#000')
                .text('Bill To:', 50, yPos)

            yPos += 20
            doc
                .fontSize(10)
                .fillColor('#666')
                .text(order.shippingAddress.name, 50, yPos)
            yPos += 15
            doc.text(order.shippingAddress.phone, 50, yPos)
            yPos += 15
            doc.text(order.shippingAddress.line1, 50, yPos)
            yPos += 15
            if (order.shippingAddress.line2) {
                doc.text(order.shippingAddress.line2, 50, yPos)
                yPos += 15
            }
            doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`, 50, yPos)

            // GST Info (if applicable)
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
                    .text(order.gstInvoice.companyName, 350, yPos)
                yPos += 15
                doc.text(`GSTIN: ${order.gstInvoice.gstin}`, 350, yPos)
            }

            // Items Table
            yPos += 40
            doc
                .strokeColor('#D4A574')
                .lineWidth(1)
                .moveTo(50, yPos)
                .lineTo(550, yPos)
                .stroke()

            yPos += 15

            // Table Headers
            doc
                .fontSize(10)
                .fillColor('#000')
                .font('Helvetica-Bold')
                .text('Item', 50, yPos)
                .text('Qty', 350, yPos)
                .text('Rate', 400, yPos)
                .text('Discount', 450, yPos)
                .text('Amount', 500, yPos, { align: 'right' })

            yPos += 10
            doc
                .strokeColor('#ccc')
                .lineWidth(0.5)
                .moveTo(50, yPos)
                .lineTo(550, yPos)
                .stroke()

            yPos += 15

            // Table Items
            doc.font('Helvetica')
            order.items.forEach(item => {
                const itemTotal = (item.price - item.discount) * item.quantity
                doc
                    .fillColor('#666')
                    .text(item.name.substring(0, 40), 50, yPos, { width: 280 })
                    .text(item.quantity, 350, yPos)
                    .text(`₹${item.price}`, 400, yPos)
                    .text(item.discount > 0 ? `₹${item.discount}` : '-', 450, yPos)
                    .fillColor('#000')
                    .text(`₹${itemTotal.toLocaleString()}`, 500, yPos, { align: 'right' })

                yPos += 25
            })

            // Subtotals
            yPos += 10
            doc
                .strokeColor('#ccc')
                .lineWidth(0.5)
                .moveTo(350, yPos)
                .lineTo(550, yPos)
                .stroke()

            yPos += 15

            // Calculations
            doc
                .fontSize(10)
                .fillColor('#666')
                .text('Subtotal:', 400, yPos)
                .fillColor('#000')
                .text(`₹${order.subtotal.toLocaleString()}`, 500, yPos, { align: 'right' })

            if (order.discount > 0) {
                yPos += 20
                doc
                    .fillColor('#666')
                    .text('Discount:', 400, yPos)
                    .fillColor('#10b981')
                    .text(`-₹${order.discount.toLocaleString()}`, 500, yPos, { align: 'right' })
            }

            yPos += 20
            doc
                .fillColor('#666')
                .text('Shipping:', 400, yPos)
                .fillColor('#000')
                .text(order.shipping === 0 ? 'FREE' : `₹${order.shipping.toLocaleString()}`, 500, yPos, { align: 'right' })

            // GST Breakdown
            const cgst = order.tax / 2
            const sgst = order.tax / 2

            yPos += 20
            doc
                .fillColor('#666')
                .text('CGST (9%):', 400, yPos)
                .fillColor('#000')
                .text(`₹${cgst.toFixed(2)}`, 500, yPos, { align: 'right' })

            yPos += 20
            doc
                .fillColor('#666')
                .text('SGST (9%):', 400, yPos)
                .fillColor('#000')
                .text(`₹${sgst.toFixed(2)}`, 500, yPos, { align: 'right' })

            yPos += 15
            doc
                .strokeColor('#D4A574')
                .lineWidth(2)
                .moveTo(350, yPos)
                .lineTo(550, yPos)
                .stroke()

            yPos += 15

            // Total
            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#D4A574')
                .text('Total Amount:', 400, yPos)
                .text(`₹${order.total.toLocaleString()}`, 500, yPos, { align: 'right' })

            // Payment Info
            yPos += 40
            doc
                .fontSize(10)
                .font('Helvetica')
                .fillColor('#666')
                .text(`Payment Method: ${order.payment.method.toUpperCase()}`, 50, yPos)

            yPos += 15
            doc.text(`Payment Status: ${order.payment.status.toUpperCase()}`, 50, yPos)

            if (order.payment.transactionId) {
                yPos += 15
                doc.text(`Transaction ID: ${order.payment.transactionId}`, 50, yPos)
            }

            // Footer
            doc
                .fontSize(8)
                .fillColor('#999')
                .text('This is a computer-generated invoice and does not require a signature.', 50, 750, { align: 'center' })
                .text('Thank you for your business!', 50, 765, { align: 'center' })

            doc.end()
        } catch (error) {
            reject(error)
        }
    })
}
