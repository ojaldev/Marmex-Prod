# Security & Functionality Implementation Plan

> Execution plan for the Sonnet model. Work top to bottom. Each task is self-contained
> with exact files, exact edits, and a verification step. Do **not** skip the "Verify"
> line — run it before moving to the next task.
>
> **Excluded from this plan:** rotating committed git secrets (handled separately by the user).
>
> **Conventions**
> - This is a Next.js 16 App Router project, ESM (`"type": "module"`), JavaScript (not TS).
> - Admin auth helper already exists: `lib/admin-auth.js` → `export async function isAdmin(request)` returns `Promise<boolean>`.
> - Rate-limit helpers already exist: `lib/rate-limit.js` → `checkRateLimit(id, max, windowMs)` and `getClientIP(request)`.
> - After each code change, run `npm run lint` and (if practical) `npm run build`. Never commit unless the user asks.

---

## Phase 0 — Shared guard helper (do this first)

Several tasks below need the same admin gate. Add one reusable helper so every route uses the identical check.

**File:** `lib/admin-auth.js` — append this export at the bottom (keep the existing `isAdmin`):

```js
import { NextResponse } from 'next/server'

/**
 * Guard for admin-only route handlers.
 * Returns a 403 NextResponse if the caller is not an admin, otherwise null.
 *
 * Usage at the top of a handler:
 *   const denied = await requireAdmin(request)
 *   if (denied) return denied
 */
export async function requireAdmin(request) {
    const ok = await isAdmin(request)
    if (!ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return null
}
```

> Note: `lib/admin-auth.js` currently does not import `NextResponse`. Add the import at the top of the file if it isn't already there.

**Verify:** `npm run lint` passes.

---

## Phase 1 — P0 Critical

### Task 1.1 — Lock down catalog / config / seed mutation endpoints

**Problem:** These handlers have zero auth and are outside the `/admin` middleware matcher. Anyone can create/edit/delete the catalog, portfolio, testimonials, and rewrite site config (including GST rate used in order totals).

Add the guard as the **first line inside the `try` block** of each handler listed below:

```js
const denied = await requireAdmin(request)
if (denied) return denied
```

Add the import to each file:
```js
import { requireAdmin } from '@/lib/admin-auth'
```

**Handlers to guard (GET handlers stay public — only guard mutations):**

| File | Handlers to guard |
|---|---|
| `app/api/products/route.js` | `POST` |
| `app/api/products/[id]/route.js` | `PUT`, `DELETE` |
| `app/api/categories/route.js` | `POST` |
| `app/api/categories/[id]/route.js` | `PUT`, `DELETE` |
| `app/api/projects/route.js` | `POST` |
| `app/api/projects/[id]/route.js` | `PUT`, `DELETE` |
| `app/api/testimonials/route.js` | `POST` |
| `app/api/testimonials/[id]/route.js` | `PUT`, `DELETE` |
| `app/api/site-config/route.js` | `PUT` |
| `app/api/seed/categories/route.js` | `POST`, `PUT` |

> For handlers whose signature is `(request, { params })`, `request` is already in scope — use it.
> For any handler that does **not** currently accept `request` as its first arg, change the signature to include it (e.g. `export async function POST(request)`).

**Verify:**
- `npm run lint` passes.
- Manual: `curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d '{}'` returns `403`.
- Log in to `/admin`, confirm creating/editing a product still works (the admin UI sends the `admin-auth` cookie, which `isAdmin` accepts).

---

### Task 1.2 — Validate payment amount against the real order total

**Problem:** `POST /api/payment/create-order` trusts a client-supplied `amount`, and `POST /api/payment/verify` never checks the paid amount against `Order.total`. A user can pay ₹1 for any order and have it marked paid.

**Edit `app/api/payment/create-order/route.js`:**

Replace the body so the Razorpay amount comes from the DB order, not the client:

```js
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { createRazorpayOrder } from '@/lib/razorpay'

export async function POST(request) {
    try {
        const session = await auth()
        const { orderId, customerInfo } = await request.json()

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
        }

        await connectDB()
        const order = await Order.findById(orderId).lean()
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Authorization: logged-in users may only pay for their own orders.
        // Guest orders (no order.user) are allowed to proceed.
        if (order.user && (!session || order.user.toString() !== session.user.id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Server-authoritative amount — never trust the client.
        const amount = order.total

        const razorpayOrder = await createRazorpayOrder(amount, orderId, {
            customer_name: customerInfo?.name || session?.user?.name || 'Guest',
            customer_email: customerInfo?.email || session?.user?.email || '',
            order_id: orderId
        })

        return NextResponse.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        })
    } catch (error) {
        console.error('Create order error:', error)
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
    }
}
```

> If the client currently sends `amount` to this endpoint, that's now ignored — safe. Check the checkout page (`app/checkout/page.js`) still calls it with `orderId`; it does not need to change, but confirm it isn't reading a field this endpoint no longer returns.

**Edit `app/api/payment/verify/route.js`:**

After the order is fetched (currently around line 41–45) and **before** setting `order.payment.status = 'completed'`, add an amount check. `paymentDetails.amount` is in paise; `order.total` is in rupees.

```js
// Server-authoritative amount check — reject underpayment/overpayment.
const expectedPaise = Math.round(order.total * 100)
if (Number(paymentDetails.amount) !== expectedPaise) {
    console.error(`Payment amount mismatch: paid=${paymentDetails.amount} expected=${expectedPaise} order=${order.orderNumber}`)
    return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
}
```

**Verify:**
- `npm run lint` passes.
- Trace the happy path in `app/checkout/page.js`: a normal card payment still completes end to end (the amounts will match).
- Reasoning check: `getPaymentDetails` returns Razorpay's `payment` entity where `amount` is paise — confirm against `lib/razorpay.js` (`razorpay.payments.fetch`). Correct.

---

### Task 1.3 — Remove hardcoded admin password fallback

**Problem:** `app/api/auth/login/route.js:5` → `const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Marmex@OmShanti'`. If the env var is unset the app ships a public password.

**Edit `app/api/auth/login/route.js`:**

Replace the constant and add a fail-closed check inside `POST`:

```js
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
```

Then, immediately after reading `password` from the request body and before comparing:

```js
if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD is not configured')
    return NextResponse.json({ error: 'Admin login is not configured' }, { status: 500 })
}
```

**Verify:**
- `grep -rn "Marmex@OmShanti" app lib` returns nothing.
- Confirm `ADMIN_PASSWORD` exists in `.env.local` (it should — do not print its value). If missing, tell the user; login will now fail closed until it's set.

---

## Phase 2 — P1 Major

### Task 2.1 — Fix guest-invoice IDOR / PII leak

**Problem:** `app/api/orders/[id]/invoice/route.js` returns the PDF (name, address, phone) to any unauthenticated caller as long as the order has a `guestEmail`, with no ownership proof. Order IDs are enumerable.

**Chosen fix (minimal, no schema change):** require the caller to prove they know the guest email tied to the order, via a query param, when there is no session.

**Edit `app/api/orders/[id]/invoice/route.js`** — in the guest branch (currently: `if (!session) { if (!order.guestEmail) return 401 }`), replace with an email-match challenge:

```js
if (!isAdmin) {
    if (!session) {
        // Guest access requires proving knowledge of the order's email.
        const url = new URL(request.url)
        const providedEmail = (url.searchParams.get('email') || '').trim().toLowerCase()
        const orderEmail = (order.guestEmail || '').trim().toLowerCase()
        if (!orderEmail || !providedEmail || providedEmail !== orderEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    } else {
        if (!order.user || order.user.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }
    }
}
```

**Also update the caller:** find where the invoice link/button is built for guests (search `invoice` in `app/order-confirmation/` and `components/`). Append `?email=<encodeURIComponent(guestEmail)>` to the guest invoice URL. Logged-in users' links are unchanged.

> If a cleaner UX is wanted later, replace the email param with a signed token stored on the order at creation time. Out of scope for this pass — note it as a follow-up.

**Verify:**
- Guest invoice URL without `?email=` → `401`.
- Guest invoice URL with correct `?email=` → PDF downloads.
- Logged-in owner still downloads their own invoice.

---

### Task 2.2 — Protect the reviews image-upload endpoint

**Problem:** `app/api/upload/route.js` (used for review photos) has no auth and no rate limit, unlike `app/api/upload-image/route.js`. Anyone can push unlimited files to Cloudinary.

**Edit `app/api/upload/route.js`** — require a logged-in user (reviews are user-submitted, so a session is the right gate, not admin) and add a rate limit:

```js
import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { auth } from '@/lib/auth'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Please login to upload' }, { status: 401 })
        }

        const ip = getClientIP(request)
        const rl = checkRateLimit(`review-upload:${ip}`, 10, 10 * 60 * 1000)
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many uploads. Try again later.' }, { status: 429 })
        }

        const { file } = await request.json()
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const result = await uploadImage(file, {
            folder: 'reviews',
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        })

        return NextResponse.json({ url: result.secure_url })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}
```

**Verify:** Anonymous `POST /api/upload` → `401`. A logged-in user can still attach a review photo.

---

### Task 2.3 — Move `site-config` off the ephemeral filesystem into MongoDB

**Problem:** `app/api/site-config/route.js` reads/writes `data/site-config.json` on the local filesystem. On Railway/most PaaS this is ephemeral and per-instance, so admin settings silently reset on redeploy and don't propagate. `app/api/orders/route.js:getGstRate()` also reads this file — the GST rate must stay reliable.

**Step 1 — New model `models/SiteConfig.js`:**

```js
import mongoose from 'mongoose'

// Single-document collection. `key` is always "default".
const siteConfigSchema = new mongoose.Schema({
    key: { type: String, default: 'default', unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true, minimize: false })

export default mongoose.models.SiteConfig || mongoose.model('SiteConfig', siteConfigSchema)
```

**Step 2 — Helper `lib/site-config.js`** (seeds from the JSON file on first read so nothing is lost):

```js
import fs from 'fs'
import path from 'path'
import connectDB from '@/lib/mongodb'
import SiteConfig from '@/models/SiteConfig'

function readJsonFallback() {
    try {
        const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'site-config.json'), 'utf8')
        return JSON.parse(raw)
    } catch {
        return {}
    }
}

export async function getSiteConfig() {
    await connectDB()
    let doc = await SiteConfig.findOne({ key: 'default' }).lean()
    if (!doc) {
        const seed = readJsonFallback()
        doc = await SiteConfig.create({ key: 'default', data: seed })
        doc = doc.toObject()
    }
    return doc.data || {}
}

export function deepMerge(target, source) {
    const result = { ...target }
    for (const key of Object.keys(source)) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
            typeof target[key] === 'object' && !Array.isArray(target[key])) {
            result[key] = deepMerge(target[key] || {}, source[key])
        } else {
            result[key] = source[key]
        }
    }
    return result
}

export async function updateSiteConfig(updates) {
    await connectDB()
    const current = await getSiteConfig()
    const merged = deepMerge(current, updates)
    await SiteConfig.findOneAndUpdate(
        { key: 'default' },
        { data: merged },
        { upsert: true, new: true }
    )
    return merged
}
```

**Step 3 — Rewrite `app/api/site-config/route.js`** to use the helper (and keep the admin guard from Task 1.1):

```js
import { NextResponse } from 'next/server'
import { getSiteConfig, updateSiteConfig } from '@/lib/site-config'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
    try {
        const config = await getSiteConfig()
        return NextResponse.json(config, {
            headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
        })
    } catch (error) {
        console.error('Error reading site config:', error)
        return NextResponse.json({}, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        const denied = await requireAdmin(request)
        if (denied) return denied

        const updates = await request.json()
        const merged = await updateSiteConfig(updates)
        return NextResponse.json(merged)
    } catch (error) {
        console.error('Error updating site config:', error)
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
    }
}
```

**Step 4 — Update `getGstRate()` in `app/api/orders/route.js`** to read from the DB helper. It is currently synchronous and reads the file. Make it async:

```js
import { getSiteConfig } from '@/lib/site-config'

async function getGstRate() {
    try {
        const config = await getSiteConfig()
        return Number(config?.pricing?.gstRate ?? 18)
    } catch {
        return 18
    }
}
```
Then change its call site inside `POST` from `const gstRate = getGstRate()` to `const gstRate = await getGstRate()`. Remove the now-unused `fs`/`path` imports if nothing else uses them in that file.

**Verify:**
- `GET /api/site-config` returns the same config as before (seeded from the JSON on first hit).
- Admin Settings page saves a change; restart the dev server; the change persists.
- Place a test order; the GST line still computes at the configured rate.

---

### Task 2.4 — Turn off `typescript.ignoreBuildErrors`

**Problem:** `next.config.js` sets `typescript: { ignoreBuildErrors: true }`, masking real errors.

**Action:** This project is JS-first, so flipping it may surface pre-existing issues. Do this **last** and gated:
1. Set `ignoreBuildErrors: false` in `next.config.js`.
2. Run `npm run build`.
3. If it builds clean, keep the change. If it surfaces many errors, revert the flag, add a `// TODO: re-enable after type cleanup` comment, and report the error count to the user instead of fixing blindly.

**Verify:** `npm run build` result recorded (clean, or reverted with a count).

---

## Phase 3 — P2 Functionality & hygiene

### Task 3.1 — Make review "verified purchase" real
`app/api/reviews/route.js:169` hardcodes `verified: false` with a TODO. Before creating the review, check whether the user has a delivered/paid order containing `productId`:

```js
import Order from '@/models/Order'
// ...
const hasPurchased = await Order.exists({
    user: session.user.id,
    'items.productId': productId,
    status: { $in: ['delivered', 'shipped', 'processing', 'confirmed'] }
})
// ...
verified: Boolean(hasPurchased),
```

**Verify:** A review from a buyer gets `verified: true`; a review from a non-buyer gets `false`.

### Task 3.2 — Apply order-level discount to the server total
In `app/api/orders/route.js`, `serverTotal` is `subtotal + tax + shipping` and never subtracts `validatedData.discount`, yet `discount` is stored and shown on the invoice. Decide the intended formula with the user, then make total and stored discount consistent. Likely:

```js
const serverDiscount = Number(validatedData.discount) || 0
const serverTotal = serverSubtotal + serverTax + serverShipping - serverDiscount
```
…and store `discount: serverDiscount`. **Do not** change this without confirming how promo discounts are meant to apply (pre- or post-tax) — flag to the user first.

### Task 3.3 — Stop trusting client price for unknown products
`app/api/orders/route.js:156` falls back to the client's `item.price` when a product isn't found in the DB. Reject instead:

```js
const dbProduct = productMap.get(item.productId)
if (!dbProduct) {
    return NextResponse.json({ error: `Product ${item.productId} is no longer available` }, { status: 400 })
}
const unitPrice = dbProduct.price
const unitDiscount = dbProduct.discount || 0
```

### Task 3.4 — Remove sensitive `console.log` from hot paths
Strip payload/email/PII logging (or gate behind `if (process.env.NODE_ENV !== 'production')`) in:
- `app/api/payment/verify/route.js`
- `app/api/orders/route.js` (the `📦 Shiprocket ... JSON.stringify(payload)` lines)
- `app/api/reviews/route.js` (`Review submission data:` line)
- `lib/auth.js` (`CRITICAL AUTH ERROR CAUGHT` — keep a generic log, drop the object)

**Verify:** `grep -rn "console.log" app/api | wc -l` drops; no request bodies or emails are logged in production.

---

## Phase 4 — Optional (needs infra provisioning by the user)

### Task 4.1 — Durable rate limiting (Redis / Upstash)
`lib/rate-limit.js` is in-memory: it resets on cold start and is per-instance, so it barely limits anything on serverless/multi-instance. This requires the user to provision Upstash and add `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. **Do not start this without those env vars.** When available:
1. `npm i @upstash/ratelimit @upstash/redis`
2. Add a `lib/rate-limit-redis.js` exporting an async `checkRateLimit` with the same shape (`{ success, limit, remaining, reset }`).
3. Swap imports in the routes that currently use `checkRateLimit` (login, register, contact, orders, uploads, custom).
Keep the in-memory version as a fallback when env vars are absent.

---

## Execution order summary

1. Phase 0 — `requireAdmin` helper
2. Task 1.1 — auth on catalog/config/seed mutations
3. Task 1.2 — payment amount validation
4. Task 1.3 — remove hardcoded admin password
5. Task 2.1 — guest invoice IDOR
6. Task 2.2 — reviews upload auth
7. Task 2.3 — site-config → MongoDB
8. Task 2.4 — TS build errors (gated, do last in Phase 2)
9. Phase 3 — functionality fixes (3.2 needs user confirmation before editing)
10. Phase 4 — Redis (only if the user provisions Upstash)

**Global verification before finishing:** `npm run lint` clean, `npm run build` succeeds, and the admin panel can still CRUD products/categories/projects while anonymous `curl`s to those same endpoints return `403`.
