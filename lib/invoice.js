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

const PW       = 595.28
const PH       = 841.89
const M        = 45
const CW       = PW - 2 * M   // 505.28

const HEADER_H = 88            // dark header band height
const STRIP_H  = 22            // gold contact strip height
const FOOTER_H = 50            // dark footer band height
const FOOTER_Y = PH - FOOTER_H // 791.89 — stays within page when margin:0

// Maximum y content can reach before footer overlap (with 15pt breathing room)
const SAFE_Y = FOOTER_Y - 15  // 776.89

function fmtCurrency(n) {
    const num = Number(n || 0)
    return 'Rs. ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d) {
    return d
        ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—'
}

function cap(str) {
    if (!str) return '—'
    return String(str).charAt(0).toUpperCase() + String(str).slice(1).toLowerCase()
}

export async function generateInvoicePDF(order) {
    return new Promise((resolve, reject) => {
        try {
            // margin: 0 is critical — prevents PDFKit from auto-adding pages when we
            // draw footer text near the bottom of the page (y > PH - defaultMargin).
            const doc = new PDFDocument({ margin: 0, size: 'A4' })
            const buffers = []
            doc.on('data', b => buffers.push(b))
            doc.on('end', () => resolve(Buffer.concat(buffers)))

            // ─── HEADER BAND ─────────────────────────────────────────────────
            doc.rect(0, 0, PW, HEADER_H).fill(C.obsidian)

            doc.font('Helvetica-Bold').fontSize(22).fillColor(C.gold)
               .text(COMPANY.name, M, 26, { lineBreak: false })
            doc.font('Helvetica').fontSize(9).fillColor(C.subtle)
               .text(COMPANY.tagline, M, 55, { lineBreak: false })

            doc.font('Helvetica-Bold').fontSize(18).fillColor(C.white)
               .text('TAX INVOICE', M, 26, { width: CW, align: 'right', lineBreak: false })
            doc.font('Helvetica').fontSize(8.5).fillColor(C.lighter)
               .text(`Invoice No.  ${order.orderNumber || '—'}`, M, 55, { width: CW, align: 'right', lineBreak: false })
               .text(`Date  ${fmtDate(order.createdAt)}`, M, 69, { width: CW, align: 'right', lineBreak: false })

            // ─── GOLD CONTACT STRIP ──────────────────────────────────────────
            doc.rect(0, HEADER_H, PW, STRIP_H).fill(C.gold)
            const contactParts = [COMPANY.address, COMPANY.phone, COMPANY.email]
            if (COMPANY.gstin) contactParts.push(`GSTIN: ${COMPANY.gstin}`)
            doc.font('Helvetica').fontSize(8).fillColor(C.obsidian)
               .text(contactParts.join('   |   '), 0, HEADER_H + 7, { width: PW, align: 'center', lineBreak: false })

            // ─── BILLING / ORDER DETAILS ─────────────────────────────────────
            const addr     = order.shippingAddress || {}
            const R_COL    = PW / 2 + 8
            const R_W      = PW - M - R_COL
            const SEC_Y    = HEADER_H + STRIP_H + 14  // ~124

            let y = SEC_Y

            // Section labels
            doc.font('Helvetica-Bold').fontSize(7).fillColor(C.gold)
               .text('BILL TO', M, y, { lineBreak: false })
               .text('ORDER DETAILS', R_COL, y, { lineBreak: false })

            y += 13

            // Billing address
            doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.text)
               .text(addr.name || '—', M, y, { lineBreak: false })
            y += 15
            doc.font('Helvetica').fontSize(9).fillColor(C.muted)
            if (addr.phone) { doc.text(addr.phone, M, y, { lineBreak: false }); y += 12 }
            doc.text(addr.line1 || '—', M, y, { lineBreak: false }); y += 12
            if (addr.line2) { doc.text(addr.line2, M, y, { lineBreak: false }); y += 12 }
            const cityStr = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')
            if (cityStr) doc.text(cityStr, M, y, { lineBreak: false })
            // y intentionally not incremented — TABLE_TOP uses Math.max(y+..., boxY+...)

            // Right column: order details box (16pt per row — compact)
            const BOX_Y    = SEC_Y + 13
            const BOX_RH   = 16
            const detailRows = [
                ['Order No.', order.orderNumber || '—'],
                ['Date',      fmtDate(order.createdAt)],
                ['Payment',   cap(order.payment?.method)],
                ['Status',    cap(order.payment?.status)],
            ]
            if (order.payment?.transactionId) {
                detailRows.push(['Txn ID', String(order.payment.transactionId).substring(0, 22)])
            }

            const BOX_H = detailRows.length * BOX_RH + 10
            doc.rect(R_COL - 8, BOX_Y - 3, R_W + 8, BOX_H).fillAndStroke(C.offWhite, C.border)

            let boxY = BOX_Y + 4
            detailRows.forEach(([lbl, val]) => {
                doc.font('Helvetica').fontSize(8).fillColor(C.muted)
                   .text(lbl, R_COL, boxY, { lineBreak: false })
                doc.font('Helvetica-Bold').fontSize(8).fillColor(C.text)
                   .text(val, R_COL, boxY, { width: R_W - 4, align: 'right', lineBreak: false })
                boxY += BOX_RH
            })

            if (order.gstInvoice?.needed) {
                boxY += 6
                doc.font('Helvetica-Bold').fontSize(7).fillColor(C.gold)
                   .text('GST INVOICE FOR', R_COL, boxY, { lineBreak: false }); boxY += 12
                doc.font('Helvetica-Bold').fontSize(9).fillColor(C.text)
                   .text(order.gstInvoice.companyName || '—', R_COL, boxY, { lineBreak: false }); boxY += 12
                doc.font('Helvetica').fontSize(8).fillColor(C.muted)
                   .text(`GSTIN: ${order.gstInvoice.gstin || '—'}`, R_COL, boxY, { lineBreak: false }); boxY += 12
            }

            // ─── ITEMS TABLE ─────────────────────────────────────────────────
            const ROW_H     = 22
            const TABLE_TOP = Math.max(y + 20, boxY + 12)

            const C_ITEM  = M
            const C_QTY   = M + 264
            const C_RATE  = M + 308
            const C_DISC  = M + 392

            // Header row
            doc.rect(M, TABLE_TOP, CW, ROW_H).fill(C.tableHeaderBg)
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.white)
               .text('DESCRIPTION', C_ITEM + 5, TABLE_TOP + 8, { lineBreak: false })
               .text('QTY',         C_QTY,      TABLE_TOP + 8, { lineBreak: false })
               .text('UNIT RATE',   C_RATE,      TABLE_TOP + 8, { lineBreak: false })
               .text('DISC',        C_DISC,      TABLE_TOP + 8, { lineBreak: false })
               .text('AMOUNT',      M,           TABLE_TOP + 8, { width: CW - 4, align: 'right', lineBreak: false })

            let tY = TABLE_TOP + ROW_H
            const items = order.items || []

            // Stop adding rows when less than 220pt remain (enough for totals + payment)
            const ITEM_CUTOFF = SAFE_Y - 220

            items.forEach((item, idx) => {
                if (tY > ITEM_CUTOFF) {
                    doc.addPage()
                    tY = M + 20
                }
                const price   = Number(item.price) || 0
                const discPct = Number(item.discount) || 0
                const qty     = Number(item.quantity) || 1
                const unit    = discPct > 0 ? price * (100 - discPct) / 100 : price
                const amount  = unit * qty

                if (idx % 2 !== 0) doc.rect(M, tY, CW, ROW_H).fill(C.tableAlt)

                doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.text)
                   .text(String(item.name || '—').substring(0, 38), C_ITEM + 5, tY + 7, { lineBreak: false })
                doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
                   .text(String(qty), C_QTY, tY + 7, { lineBreak: false })
                   .text(fmtCurrency(price), C_RATE, tY + 7, { lineBreak: false })
                   .text(discPct > 0 ? `${discPct}%` : '—', C_DISC, tY + 7, { lineBreak: false })
                doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.text)
                   .text(fmtCurrency(amount), M, tY + 7, { width: CW - 4, align: 'right', lineBreak: false })

                doc.strokeColor(C.border).lineWidth(0.35)
                   .moveTo(M, tY + ROW_H).lineTo(PW - M, tY + ROW_H).stroke()

                tY += ROW_H
            })

            // ─── TOTALS ───────────────────────────────────────────────────────
            // Reserve ~160pt: sumRows (5×18=90) + grand total band (30) + spacing (40)
            if (tY > SAFE_Y - 160) {
                doc.addPage()
                tY = M + 20
            }

            tY += 12

            const subtotal      = Number(order.subtotal) || 0
            const orderDiscount = Number(order.discount) || 0
            const shipping      = Number(order.shipping) || 0
            const tax           = Number(order.tax) || 0
            const total         = Number(order.total) || 0
            const taxRate       = Number(order.taxRate) ||
                                  (subtotal > 0 ? parseFloat(((tax / subtotal) * 100).toFixed(1)) : 18)
            const halfRate      = taxRate / 2

            const T_X   = M + 250
            const T_W   = PW - M - T_X

            const sumRows = [
                { label: 'Subtotal', value: fmtCurrency(subtotal), color: C.text },
            ]
            if (orderDiscount > 0) {
                sumRows.push({ label: 'Discount', value: `− ${fmtCurrency(orderDiscount)}`, color: C.green })
            }
            sumRows.push({ label: 'Shipping',                    value: shipping === 0 ? 'FREE' : fmtCurrency(shipping), color: C.text })
            sumRows.push({ label: `CGST (${halfRate.toFixed(1)}%)`, value: fmtCurrency(tax / 2), color: C.muted })
            sumRows.push({ label: `SGST (${halfRate.toFixed(1)}%)`, value: fmtCurrency(tax / 2), color: C.muted })

            const S_ROW_H   = 18
            const T_BOX_H   = sumRows.length * S_ROW_H + 10
            doc.rect(T_X - 10, tY, T_W + 10, T_BOX_H).fillAndStroke(C.offWhite, C.border)

            let sumY = tY + 6
            sumRows.forEach(row => {
                doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
                   .text(row.label, T_X, sumY, { lineBreak: false })
                doc.font('Helvetica').fontSize(8.5).fillColor(row.color)
                   .text(row.value, T_X, sumY, { width: T_W - 10, align: 'right', lineBreak: false })
                sumY += S_ROW_H
            })

            doc.strokeColor(C.gold).lineWidth(1.2)
               .moveTo(T_X - 10, sumY + 3).lineTo(PW - M, sumY + 3).stroke()
            sumY += 12

            doc.rect(T_X - 10, sumY, T_W + 10, 30).fill(C.obsidian)
            doc.font('Helvetica-Bold').fontSize(10).fillColor(C.gold)
               .text('TOTAL', T_X, sumY + 10, { lineBreak: false })
               .text(fmtCurrency(total), T_X, sumY + 10, { width: T_W - 10, align: 'right', lineBreak: false })

            tY = sumY + 44

            // ─── PAYMENT + LEGAL ─────────────────────────────────────────────
            // Reserve ~65pt for payment block
            if (tY > SAFE_Y - 65) {
                doc.addPage()
                tY = M + 20
            }

            doc.strokeColor(C.border).lineWidth(0.5)
               .moveTo(M, tY).lineTo(PW - M, tY).stroke()
            tY += 10

            doc.font('Helvetica-Bold').fontSize(7).fillColor(C.gold)
               .text('PAYMENT INFORMATION', M, tY, { lineBreak: false })
            tY += 13
            doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
               .text(`Method: ${cap(order.payment?.method)}   |   Status: ${cap(order.payment?.status)}`, M, tY, { lineBreak: false })
            if (order.payment?.transactionId) {
                tY += 13
                doc.text(`Transaction ID: ${order.payment.transactionId}`, M, tY, { lineBreak: false })
            }
            tY += 20
            doc.font('Helvetica').fontSize(7.5).fillColor(C.subtle)
               .text(
                   'This is a computer-generated invoice and does not require a physical signature.',
                   M, tY, { width: CW * 0.72, lineBreak: false }
               )

            // ─── FOOTER BAND ─────────────────────────────────────────────────
            // Always anchored to the absolute bottom of the CURRENT page.
            // With margin:0 these y values (FOOTER_Y+11, FOOTER_Y+28) are well within
            // PH=841.89 so PDFKit never auto-adds a page here.
            doc.rect(0, FOOTER_Y, PW, FOOTER_H).fill(C.obsidian)
            doc.font('Helvetica-Bold').fontSize(10).fillColor(C.gold)
               .text('Thank you for your business!', 0, FOOTER_Y + 11, { width: PW, align: 'center', lineBreak: false })
            doc.font('Helvetica').fontSize(7.5).fillColor(C.lighter)
               .text(
                   `${COMPANY.name}   •   ${COMPANY.phone}   •   ${COMPANY.email}`,
                   0, FOOTER_Y + 29, { width: PW, align: 'center', lineBreak: false }
               )

            doc.end()
        } catch (err) {
            reject(err)
        }
    })
}
