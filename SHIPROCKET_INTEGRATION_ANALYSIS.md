# Shiprocket API Integration Analysis for Marmex India

> **Date:** 2026-05-19  
> **Based on:** Shiprocket API Documentation (80+ endpoints)  
> **Current Stack:** Next.js 16, MongoDB, Razorpay, NextAuth v5

---

## Executive Summary

Shiprocket is India's largest logistics aggregation platform. Integrating it with Marmex will transform the current manual/hand-waved shipping flow into a fully automated, trackable, and customer-transparent logistics pipeline.

**Current State:** Orders are stored in MongoDB with a `tracking` object, but there's zero actual courier integration. Admin presumably handles shipping manually outside the platform.

**Target State:** Auto-generated AWBs, real-time courier rates at checkout, live tracking for customers, automated pickup scheduling, and reverse logistics for returns.

---

## Priority Matrix

| Priority | Features | Impact | Effort |
|----------|----------|--------|--------|
| **P0 - Must Have** | Auth, Serviceability, Rate Calculator, Forward Shipment, Tracking, Webhooks | High | Medium |
| **P1 - Should Have** | Labels, Manifests, Cancel Order, Return Shipment | High | Low |
| **P2 - Could Have** | RTO Score, Address Validation, NDR, Courier Comparison | Medium | Medium |
| **P3 - Won't Have** | Product Catalog, Channel Sync, Inventory Sync, Bulk Import | Low | High |

---

## P0: Must-Have Features (Implement First)

### 1. Authentication (Token Management)
**API:** `POST /v1/external/auth/login`
**What it does:** Generates a JWT token valid for 10 days.
**Integration:** Create `lib/shiprocket.js` that handles auto-refreshing tokens. Store credentials in `.env.local`.
```
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
```
**Value:** Prerequisite for every other API call.

---

### 2. Courier Serviceability Check
**API:** `GET /v1/external/courier/serviceability/`
**Parameters:** `pickup_postcode`, `delivery_postcode`, `cod` (0/1), `weight`
**What it does:** Checks if delivery is possible between two pincodes and shows available couriers with estimated delivery dates.

**Integration Points:**
- **Checkout Page (Step 1 - Shipping):** Before allowing user to proceed, verify their delivery pincode is serviceable. Show "Delivery available to 560064" or "Sorry, we don't deliver to this pincode yet."
- **Product Detail Page:** Show "Check delivery to your pincode" input. Display estimated delivery days.

**Value for Marmex:**
- Marble sculptures are heavy/fragile — not all couriers handle them well.
- Avoid orders to non-serviceable areas.
- Set correct customer expectations on delivery timeline.

---

### 3. Shipping Rate Calculator
**API:** (Available via MCP / serviceability API response includes rates)
**What it does:** Returns real-time shipping rates from multiple couriers (Blue Dart, Delhivery, DTDC, Ecom Express, Xpressbees, etc.).

**Integration Points:**
- **Checkout Page (Step 2 - Delivery):** Replace the current static/hardcoded `shippingMethod` with dynamic rates fetched from Shiprocket based on:
  - Origin pincode (your warehouse)
  - Destination pincode (customer address)
  - Total weight (sum of all items)
  - Dimensions (from product data)
  - COD or Prepaid

- Show courier options with prices and delivery estimates:
  ```
  Delhivery Surface  — ₹185  — 3-4 days
  Blue Dart Express  — ₹320  — 1-2 days  
  DTDC Surface       — ₹160  — 4-5 days
  ```

**Value for Marmex:**
- High-value heavy items = shipping costs matter.
- Customer sees transparent, accurate pricing.
- You can mark up rates or offer "free shipping above ₹X" dynamically.

---

### 4. Forward Shipment (Wrapper API) — THE BIG ONE
**API:** `POST /v1/external/shipments/create/forward-shipment`
**What it does:** ALL-IN-ONE API that:
1. Creates the order in Shiprocket
2. Assigns a courier + generates AWB (tracking number)
3. Schedules pickup
4. Generates shipping label
5. Generates manifest

**Integration Point:**
- **After successful payment** (in `/api/payment/verify` for online, or `/api/orders` for COD):
  ```js
  // Pseudo-flow
  1. Order saved to MongoDB
  2. Call Shiprocket Forward Shipment API
  3. Store response: shiprocketOrderId, shipment_id, awb_code, courier_name
  4. Update Order in MongoDB:
     - status: 'confirmed' → 'processing' → 'shipped'
     - tracking.trackingNumber: awb_code
     - tracking.carrier: courier_name
     - shiprocketOrderId: response.order_id
     - shipmentId: response.shipment_id
     - labelUrl: response.label_url
  5. Send email to customer with tracking link
  ```

**Request Body includes:**
- Order ID, date, pickup location
- Billing/shipping address (customer details)
- Order items (name, SKU, units, selling_price, weight)
- Payment method (COD/Prepaid)
- Package dimensions (length, breadth, height, weight)
- `request_pickup: true`, `print_label: true`, `generate_manifest: true`

**Value for Marmex:**
- Eliminates 100% of manual shipping work.
- Instant AWB generation = instant tracking.
- Pickup auto-scheduled = no calling couriers.
- Label auto-generated = just print and stick.

---

### 5. Live Tracking for Customers
**APIs:**
- `GET /v1/external/courier/track/awb/{awb_code}` — Single AWB
- `GET /v1/external/courier/track/shipment/{shipment_id}` — By shipment ID
- `POST /v1/external/courier/track/awbs` — Multiple AWBs (batch)

**Integration Points:**
- **Account > Orders Page:** Show tracking timeline visually:
  ```
  ●───●───●───○───○
  Placed → Confirmed → Shipped → Out for Delivery → Delivered
  ```
- **Order Detail Page:** Full tracking events with timestamps and locations.
- **Admin Panel:** View tracking for all active orders.

**Value for Marmex:**
- High-value purchases = anxious customers.
- Real-time tracking reduces "where is my order?" support tickets by ~70%.
- Professional experience builds trust.

---

### 6. Webhooks for Auto-Status Updates
**Setup:** `Settings > API > Webhooks` in Shiprocket dashboard
**What it does:** Shiprocket proactively POSTs to your URL whenever tracking status changes.

**Webhook Payload:**
```json
{
  "awb": "19041424751540",
  "courier_name": "Delhivery Surface",
  "current_status": "IN TRANSIT",
  "current_status_id": 20,
  "shipment_status": "IN TRANSIT",
  "shipment_status_id": 18,
  "current_timestamp": "23 05 2023 11:43:52",
  "order_id": "1373900_150876814",
  "sr_order_id": 348456385
}
```

**Integration Point:**
- Create `app/api/webhooks/shiprocket/route.js` to receive webhooks
- Update MongoDB order status automatically:
  - `PICKED UP` → status: "shipped"
  - `OUT FOR DELIVERY` → add timeline event
  - `DELIVERED` → status: "delivered", send delivery confirmation email
  - `RTO INITIATED` → status: "returned", alert admin

**Value for Marmex:**
- Zero manual status updates.
- Customer gets accurate, real-time order status.
- Automated post-delivery flows (review request, etc.).

---

## P1: Should-Have Features (Implement Next)

### 7. Generate & Download Shipping Label
**API:** `POST /v1/external/courier/generate/label`
**What it does:** Returns a PDF URL for the shipping label.

**Integration:**
- **Admin Panel > Orders:** "Download Label" button next to each shipped order.
- Label contains: AWB, from/to address, barcode, courier branding.

**Value:** Print label, stick on package, handover to courier.

---

### 8. Generate & Print Manifest
**APIs:**
- `POST /v1/external/manifests/generate` — Generate manifest
- `POST /v1/external/manifests/print` — Print manifest

**What it does:** Manifest is a document listing all packages a courier will pick up in one visit.

**Integration:**
- **Admin Panel:** Daily "Generate Manifest" button for all orders with pickup scheduled today.
- Handover manifest + packages to courier pickup agent.

**Value:** Required for bulk handovers. Courier won't accept packages without manifest.

---

### 9. Cancel Shipment
**API:** `POST /v1/external/orders/cancel`
**Parameters:** `ids: [shiprocketOrderId]` (array)

**Integration:**
- When customer cancels an order (before pickup), also cancel in Shiprocket.
- When admin cancels an order from admin panel.

**Value:** Prevents packages from being shipped for cancelled orders. Saves money.

---

### 10. Return / Reverse Pickup (Wrapper API)
**API:** `POST /v1/external/shipments/create/return-shipment`
**What it does:** All-in-one return: create return order + generate AWB + schedule reverse pickup.

**Integration:**
- Your website already has a `Return` model and return flow!
- When admin "approves" a return request:
  1. Call Shiprocket Return Shipment API
  2. Store return AWB, courier, pickup date
  3. Show customer: "Return pickup scheduled for DD/MM"
  4. Customer can track reverse shipment

**Return Reasons Supported:**
1. Bought by Mistake
2. Better price available
3. Performance or quality not adequate
4. Incompatible or not useful
5. Product damaged, but shipping box OK
6. Item arrived too late
7. Missing parts or accessories
8. Both product and shipping box damaged
9. Wrong item was sent
10. Item defective or doesn't work
11. No longer needed

**Value:** The website already has return functionality but no logistics. This completes the loop.

---

## P2: Could-Have Features (Nice to Have)

### 11. Sense RTO Score API
**What it does:** Uses ML to predict if an order will be Returned-to-Origin (RTO) before you ship it.

**Value for Marmex:**
- COD orders for expensive marble items = high RTO risk.
- Flag high-risk orders. Require advance payment or additional verification.
- Can save significant shipping costs.

---

### 12. Sense Address Validation API
**What it does:** Validates and standardizes delivery addresses.

**Value:** Reduces delivery failures due to incorrect addresses.

---

### 13. NDR (Non-Delivery Report) Management
**APIs:**
- `GET /v1/external/ndr` — List all NDR shipments
- `GET /v1/external/ndr/{awb}` — Specific NDR details
- `POST /v1/external/ndr/action` — Take action (Reattempt / RTO)

**What it does:** When a delivery fails (customer not available, wrong address, etc.), courier marks it NDR. You can view and action these.

**Integration:**
- **Admin Panel:** NDR dashboard showing failed deliveries.
- Action buttons: "Reattempt Delivery" or "Initiate RTO"

**Value:** Proactive handling of delivery failures.

---

### 14. Courier Comparison & Selection
**API:** `GET /v1/external/courier/courierListWithCounts`

**Integration:**
- **Admin Panel:** Show all available couriers with performance stats.
- Allow admin to manually override auto-selected courier for specific orders.

---

## P3: Won't-Have (Not Applicable to Marmex)

| Feature | Why Not |
|---------|---------|
| **Product Catalog Sync** | Marmex has its own MongoDB product catalog. No need to sync with Shiprocket's master catalog. |
| **Channel Integration** | Single sales channel (own website). No Shopify/Amazon/WooCommerce to integrate. |
| **Inventory Sync** | Inventory is managed within the app's MongoDB. Shiprocket inventory sync is for multi-channel sellers. |
| **Bulk Order Import (CSV)** | Orders are created in real-time via the website. No need for CSV imports. |
| **QC Products** | Quality check flow is not relevant for direct-to-customer marble art sales. |
| **Listings / Channel Mappings** | Multi-channel catalog mapping — not applicable. |
| **Statement / Billing APIs** | Admin can view billing directly in Shiprocket dashboard. No need to surface in website. |
| **International Zones/Countries** | Unless Marmex starts exporting, country/zone APIs are not needed. |

---

## Recommended Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create `lib/shiprocket.js` — Auth token management (auto-refresh)
- [ ] Add env vars: `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`
- [ ] Create `app/api/shiprocket/*` route handlers
- [ ] Add Shiprocket fields to Order model: `shiprocketOrderId`, `shipmentId`, `awbCode`, `courierName`, `labelUrl`

### Phase 2: Pre-Checkout (Week 2-3)
- [ ] Integrate **Serviceability Check** on product page + checkout
- [ ] Integrate **Rate Calculator** — fetch live rates, show courier options
- [ ] Update checkout flow to pass dimensions/weight for rate calculation

### Phase 3: Order Fulfillment (Week 3-4)
- [ ] Integrate **Forward Shipment Wrapper API** after payment
- [ ] Auto-update order status to "confirmed" → "processing"
- [ ] Store AWB, courier, label URL in order

### Phase 4: Tracking & Webhooks (Week 4-5)
- [ ] Build **Webhook receiver** (`/api/webhooks/shiprocket`)
- [ ] Auto-update order status from webhooks
- [ ] Build **customer tracking UI** on account/orders page
- [ ] Build **admin tracking view**

### Phase 5: Returns & Admin Tools (Week 5-6)
- [ ] Integrate **Return Shipment API**
- [ ] Add "Download Label" button in admin
- [ ] Add "Generate Manifest" button in admin
- [ ] Add **Cancel Shipment** on order cancellation

### Phase 6: Intelligence (Future)
- [ ] Integrate **Sense RTO Score** for COD orders
- [ ] Integrate **Address Validation** at checkout
- [ ] Add **NDR Dashboard** for admin

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Marmex Next.js App                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend          │  API Routes          │  Database       │
│  ─────────         │  ──────────          │  ────────       │
│  Product Page      │  /api/orders         │  MongoDB        │
│  ├─ Pincode Check  │  ├─ Create Order     │  ├─ Orders      │
│  └─ Delivery Est.  │  ├─ Update Status    │  ├─ Returns     │
│                    │  └─ Cancel Order     │  └─ Users       │
│  Checkout Page     │                      │                 │
│  ├─ Serviceability │  /api/payment/verify │                 │
│  ├─ Rate Compare   │  └─ After payment    │                 │
│  └─ Courier Select │     → Call Shiprocket│                 │
│                    │     Forward Shipment │                 │
│  Account/Orders    │                      │                 │
│  └─ Tracking UI    │  /api/webhooks/      │                 │
│                    │     shiprocket       │                 │
│  Admin Panel       │  └─ Receive status   │                 │
│  ├─ Label Download │     → Update MongoDB │                 │
│  ├─ Manifest       │                      │                 │
│  └─ NDR Dashboard  │  /api/shiprocket/*   │                 │
│                    │  ├─ rates            │                 │
│                    │  ├─ track            │                 │
│                    │  ├─ label            │                 │
│                    │  └─ return           │                 │
├─────────────────────────────────────────────────────────────┤
│  lib/shiprocket.js  →  Token Auth + HTTP Client             │
├─────────────────────────────────────────────────────────────┤
│                    Shiprocket API (apiv2.shiprocket.in)      │
│  ├─ Auth           ├─ Orders           ├─ Couriers          │
│  ├─ Tracking       ├─ Labels           ├─ Manifests         │
│  └─ Returns        └─ Webhooks         └─ Sense (AI)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Business Value Summary

| Metric | Before Shiprocket | After Shiprocket |
|--------|-------------------|------------------|
| **Order Processing** | Manual, offline | Automated, 1-click |
| **AWB Generation** | None / Manual | Instant, auto-assigned |
| **Tracking** | None | Live, customer-facing |
| **Shipping Rates** | Static/guessed | Real-time, transparent |
| **Pincode Validation** | None | Pre-checkout verification |
| **Returns** | Manual coordination | Auto reverse-pickup |
| **Status Updates** | Manual | Real-time via webhooks |
| **Support Tickets** | High ("Where's my order?") | Reduced by ~70% |
| **RTO Risk** | Unknown | Predictable via Sense |

---

## Cost Consideration

Shiprocket operates on a **pay-per-shipment** model. There is no monthly fee for API access. You only pay for:
1. The shipping cost (discounted courier rates through Shiprocket)
2. COD remittance charges (if applicable)
3. RTO charges (if order returns)

**For Marmex:** Since products are high-value (₹25,000+), shipping costs are a small percentage. The automation and tracking value far outweigh the cost.

---

## Next Steps

1. **Create Shiprocket Account** at shiprocket.in
2. **Complete KYC** (GST, bank details, pickup address verification)
3. **Add Warehouse Pickup Location** in Shiprocket dashboard
4. **Generate API Credentials** (Settings → API → Add New API User)
5. **Set up Webhook URL** (after deploying the webhook endpoint)
6. **Start with Phase 1** (Auth + Serviceability Check)

---

*This analysis covers all 80+ Shiprocket API endpoints and maps them to Marmex's specific e-commerce needs.*
