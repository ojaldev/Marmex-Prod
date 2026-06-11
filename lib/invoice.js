import PDFDocument from 'pdfkit'

const COMPANY = {
    name: 'MARMEX INDIA',
    tagline: 'Premium Marble Art & Sculptures',
    address: 'Noida, Uttar Pradesh — 201301',
    phone: '+91 95821 34493',
    email: 'Marmexindia@gmail.com',
    gstin: process.env.COMPANY_GSTIN || '',
}

const C = {
    obsidian:      '#0F0F0F',
    gold:          '#D4A574',
    white:         '#FFFFFF',
    offWhite:      '#F9F7F4',
    border:        '#E8E2DA',
    text:          '#1A1A1A',
    muted:         '#666666',
    subtle:        '#999999',
    lighter:       '#BBBBBB',
    tableHeaderBg: '#1C1C1C',
    tableAlt:      '#F5F3F0',
    green:         '#16A34A',
}

const PW = 595.28
const PH = 841.89
const M  = 45
const CW = PW - 2 * M  // content width = 505.28

function fmtCurrency(n) {
    const num = Number(n || 0)
    return 'Rs. ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d) {
    return d
        ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—'
}

function capitalize(str) {
    if (!str) return '—'
    return String(str).charAt(0).toUpperCase() + String(str).slice(1).toLowerCase()
}

export async function generateInvoicePDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: M, size: 'A4' })
            const buffers = []
            doc.on('data', b => buffers.push(b))
            doc.on('end', () => resolve(Buffer.concat(buffers)))

            // ─── HEADER BAND ─────────────────────────────────────────────────
            doc.rect(0, 0, PW, 118).fill(C.obsidian)

            // Left: company name + tagline
            doc.font('Helvetica-Bold').fontSize(25).fillColor(C.gold)
               .text(COMPANY.name, M, 33, { lineBreak: false })
            doc.font('Helvetica').fontSize(9.5).fillColor(C.subtle)
               .text(COMPANY.tagline, M, 66, { lineBreak: false })

            // Right: invoice label + meta
            doc.font('Helvetica-Bold').fontSize(21).fillColor(C.white)
               .text('TAX INVOICE', M, 33, { width: CW, align: 'right', lineBreak: false })
            doc.font('Helvetica').fontSize(9).fillColor(C.lighter)
               .text(`Invoice No.  ${order.orderNumber || '—'}`, M, 66, { width: CW, align: 'right', lineBreak: false })
               .text(`Date  ${fmtDate(order.createdAt)}`, M, 82, { width: CW, align: 'right', lineBreak: false })

            // ─── GOLD CONTACT STRIP ──────────────────────────────────────────
            doc.rect(0, 118, PW, 27).fill(C.gold)
            const contactParts = [COMPANY.address, COMPANY.phone, COMPANY.email]
            if (COMPANY.gstin) contactParts.push(`GSTIN: ${COMPANY.gstin}`)
            doc.font('Helvetica').fontSize(8.5).fillColor(C.obsidian)
               .text(contactParts.join('   |   '), 0, 126, { width: PW, align: 'center', lineBreak: false })

            // ─── BILLING SECTION ─────────────────────────────────────────────
            const addr        = order.shippingAddress || {}
            const RIGHT_COL   = PW / 2 + 10
            const RIGHT_W     = PW - M - RIGHT_COL

            let y = 163

            // Section labels
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.gold)
               .text('BILL TO', M, y, { lineBreak: false })
               .text('ORDER DETAILS', RIGHT_COL, y, { lineBreak: false })

            y += 14

            // Billing address
            doc.font('Helvetica-Bold').fontSize(11).fillColor(C.text)
               .text(addr.name || '—', M, y, { lineBreak: false })
            y += 17
            doc.font('Helvetica').fontSize(9.5).fillColor(C.muted)
            if (addr.phone) {
                doc.text(addr.phone, M, y, { lineBreak: false }); y += 14
            }
            doc.text(addr.line1 || '—', M, y, { lineBreak: false }); y += 14
            if (addr.line2) {
                doc.text(addr.line2, M, y, { lineBreak: false }); y += 14
            }
            const cityLine = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')
            if (cityLine) { doc.text(cityLine, M, y, { lineBreak: false }) }

            // Order details box (right column)
            const BOX_TOP = 177
            const detailRows = [
                ['Order No.', order.orderNumber || '—'],
                ['Order Date', fmtDate(order.createdAt)],
                ['Payment',   capitalize(order.payment?.method)],
                ['Status',    capitalize(order.payment?.status)],
            ]
            if (order.payment?.transactionId) {
                detailRows.push(['Txn ID', String(order.payment.transactionId).substring(0, 22)])
            }

            const BOX_H = detailRows.length * 21 + 14
            doc.rect(RIGHT_COL - 10, BOX_TOP - 4, RIGHT_W + 10, BOX_H)
               .fillAndStroke(C.offWhite, C.border)

            let boxY = BOX_TOP + 5
            detailRows.forEach(([lbl, val]) => {
                doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
                   .text(lbl, RIGHT_COL, boxY, { lineBreak: false })
                doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.text)
                   .text(val, RIGHT_COL, boxY, { width: RIGHT_W - 2, align: 'right', lineBreak: false })
                boxY += 21
            })

            // GST invoice section (if applicable)
            if (order.gstInvoice?.needed) {
                boxY += 8
                doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.gold)
                   .text('GST INVOICE FOR', RIGHT_COL, boxY, { lineBreak: false })
                boxY += 14
                doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.text)
                   .text(order.gstInvoice.companyName || '—', RIGHT_COL, boxY, { lineBreak: false })
                boxY += 13
                doc.font('Helvetica').fontSize(9).fillColor(C.muted)
                   .text(`GSTIN: ${order.gstInvoice.gstin || '—'}`, RIGHT_COL, boxY, { lineBreak: false })
                boxY += 13
            }

            // ─── ITEMS TABLE ─────────────────────────────────────────────────
            // Column x-positions (content starts at M=45, ends at PW-M=550)
            const COL = {
                item:   M,         // Description — occupies ~250pt
                qty:    M + 256,   // Qty
                rate:   M + 300,   // Unit Rate
                disc:   M + 388,   // Discount %
                // Amount is right-aligned to PW-M
            }
            const ROW_H     = 28
            const TABLE_TOP = Math.max(y + 28, boxY + 20)
            const SAFE_Y    = PH - M - 100

            // Header row
            doc.rect(M, TABLE_TOP, CW, ROW_H).fill(C.tableHeaderBg)
            doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
               .text('DESCRIPTION',  COL.item + 6, TABLE_TOP + 10, { lineBreak: false })
               .text('QTY',          COL.qty,       TABLE_TOP + 10, { lineBreak: false })
               .text('UNIT RATE',    COL.rate,      TABLE_TOP + 10, { lineBreak: false })
               .text('DISC',         COL.disc,      TABLE_TOP + 10, { lineBreak: false })
               .text('AMOUNT',       M,             TABLE_TOP + 10, { width: CW - 4, align: 'right', lineBreak: false })

            let tY = TABLE_TOP + ROW_H
            const items = order.items || []

            items.forEach((item, idx) => {
                if (tY > SAFE_Y) {
                    doc.addPage()
                    tY = M + 20
                }

                const price     = Number(item.price) || 0
                const discPct   = Number(item.discount) || 0
                const qty       = Number(item.quantity) || 1
                const unitFinal = discPct > 0 ? price * (100 - discPct) / 100 : price
                const lineTotal = unitFinal * qty

                if (idx % 2 !== 0) {
                    doc.rect(M, tY, CW, ROW_H).fill(C.tableAlt)
                }

                doc.font('Helvetica-Bold').fontSize(9).fillColor(C.text)
                   .text(String(item.name || '—').substring(0, 36), COL.item + 6, tY + 10, { lineBreak: false })
                doc.font('Helvetica').fontSize(9).fillColor(C.muted)
                   .text(String(qty), COL.qty, tY + 10, { lineBreak: false })
                   .text(fmtCurrency(price), COL.rate, tY + 10, { lineBreak: false })
                   .text(discPct > 0 ? `${discPct}%` : '—', COL.disc, tY + 10, { lineBreak: false })
                doc.font('Helvetica-Bold').fontSize(9).fillColor(C.text)
                   .text(fmtCurrency(lineTotal), M, tY + 10, { width: CW - 4, align: 'right', lineBreak: false })

                // Row separator
                doc.strokeColor(C.border).lineWidth(0.4)
                   .moveTo(M, tY + ROW_H).lineTo(PW - M, tY + ROW_H).stroke()

                tY += ROW_H
            })

            // ─── TOTALS SECTION ───────────────────────────────────────────────
            if (tY > SAFE_Y - 140) {
                doc.addPage()
                tY = M + 20
            }

            tY += 16

            const subtotal      = Number(order.subtotal) || 0
            const orderDiscount = Number(order.discount) || 0
            const shipping      = Number(order.shipping) || 0
            const tax           = Number(order.tax) || 0
            const total         = Number(order.total) || 0
            const taxRate       = Number(order.taxRate) ||
                                  (subtotal > 0 ? parseFloat(((tax / subtotal) * 100).toFixed(1)) : 18)
            const halfRate      = taxRate / 2

            const TOTALS_X = M + 245
            const TOTALS_W = PW - M - TOTALS_X  // right half of content

            const sumRows = [
                { label: 'Subtotal',               value: fmtCurrency(subtotal),      color: C.text  },
            ]
            if (orderDiscount > 0) {
                sumRows.push({ label: 'Discount', value: `− ${fmtCurrency(orderDiscount)}`, color: C.green })
            }
            sumRows.push({ label: 'Shipping',                 value: shipping === 0 ? 'FREE' : fmtCurrency(shipping), color: C.text })
            sumRows.push({ label: `CGST (${halfRate.toFixed(1)}%)`, value: fmtCurrency(tax / 2), color: C.muted })
            sumRows.push({ label: `SGST (${halfRate.toFixed(1)}%)`, value: fmtCurrency(tax / 2), color: C.muted })

            const TOTALS_BOX_H = sumRows.length * 26 + 14
            doc.rect(TOTALS_X - 12, tY, TOTALS_W + 12, TOTALS_BOX_H)
               .fillAndStroke(C.offWhite, C.border)

            let sumY = tY + 8
            sumRows.forEach(row => {
                doc.font('Helvetica').fontSize(9).fillColor(C.muted)
                   .text(row.label, TOTALS_X, sumY, { lineBreak: false })
                doc.font('Helvetica').fontSize(9).fillColor(row.color)
                   .text(row.value, TOTALS_X, sumY, { width: TOTALS_W - 12, align: 'right', lineBreak: false })
                sumY += 26
            })

            // Gold separator line
            doc.strokeColor(C.gold).lineWidth(1.5)
               .moveTo(TOTALS_X - 12, sumY + 4).lineTo(PW - M, sumY + 4).stroke()
            sumY += 16

            // Grand total dark band
            doc.rect(TOTALS_X - 12, sumY, TOTALS_W + 12, 36).fill(C.obsidian)
            doc.font('Helvetica-Bold').fontSize(12).fillColor(C.gold)
               .text('TOTAL', TOTALS_X, sumY + 12, { lineBreak: false })
               .text(fmtCurrency(total), TOTALS_X, sumY + 12, { width: TOTALS_W - 12, align: 'right', lineBreak: false })

            tY = sumY + 52

            // ─── PAYMENT INFO ─────────────────────────────────────────────────
            if (tY > SAFE_Y - 60) {
                doc.addPage()
                tY = M + 20
            }

            // Thin gold rule
            doc.strokeColor(C.border).lineWidth(0.5)
               .moveTo(M, tY - 8).lineTo(PW - M, tY - 8).stroke()

            doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.gold)
               .text('PAYMENT INFORMATION', M, tY, { lineBreak: false })
            tY += 14
            const payMethod = capitalize(order.payment?.method)
            const payStatus = capitalize(order.payment?.status)
            doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
               .text(`Method: ${payMethod}   |   Status: ${payStatus}`, M, tY, { lineBreak: false })
            if (order.payment?.transactionId) {
                tY += 13
                doc.text(`Transaction ID: ${order.payment.transactionId}`, M, tY, { lineBreak: false })
            }

            tY += 22
            doc.font('Helvetica').fontSize(8).fillColor(C.subtle)
               .text(
                   'This is a computer-generated invoice and does not require a physical signature.',
                   M, tY, { width: CW, lineBreak: false }
               )

            // ─── FOOTER BAND ─────────────────────────────────────────────────
            const FOOTER_Y = PH - 54
            doc.rect(0, FOOTER_Y, PW, 54).fill(C.obsidian)
            doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.gold)
               .text('Thank you for your business!', 0, FOOTER_Y + 12, { width: PW, align: 'center', lineBreak: false })
            doc.font('Helvetica').fontSize(8).fillColor('#888888')
               .text(
                   `${COMPANY.name}   •   ${COMPANY.phone}   •   ${COMPANY.email}`,
                   0, FOOTER_Y + 31, { width: PW, align: 'center', lineBreak: false }
               )

            doc.end()
        } catch (err) {
            reject(err)
        }
    })
}
