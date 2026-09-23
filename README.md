# Northline Building Supply — E-commerce Prototype (Stage 1)

A client-facing prototype for a hardware / building-materials store selling vinyl flooring, stairs, doors, locks, shower bases and doors, shower accessories, toilet seats, vanities, plumbing and WPC wall panels.

The prototype demonstrates the full customer, contractor and admin experience with realistic demo data. External production services (payments, email, file storage, database) are simulated behind clean interfaces so the codebase can move to production in Stage 2 without a rewrite.

> **Placeholder notice:** "Northline Building Supply", the address, phone numbers, emails, hours, brand names, product specifications and policies are **fictional placeholders**. Product images are generated illustrations, not photographs. Replace them before launch (see [Where to change things](#where-to-change-things)).

---

## Quick start

Requirements: Node.js 20+ (tested on Node 22) and npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

The first request seeds the demo database into `.data/db.json`. Changes you make (orders, quotes, approvals, product edits) persist across restarts.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end journeys (Playwright) — run `npm run build` first |
| `npm run demo:reset` | Delete the demo database so it re-seeds on next start |

The demo data can also be reset from the **Demo** toolbar (bottom-right) → *Reset demo data*.

### Environment variables

Copy `.env.example` to `.env.local`. **Nothing is required** for the prototype. Key variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (metadata, sitemap) |
| `NEXT_PUBLIC_DEMO_MODE` | `true` shows the presenter toolbar and demo credentials; set `false` for production |
| `SESSION_SECRET` | Signs session cookies. **Required in production.** If unset a random per-process secret is used |
| `DATA_DIR` | Location of the demo JSON store and uploads (default `./.data`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GSC_VERIFICATION` | Analytics / Search Console — scripts only load when set |
| `STRIPE_*`, `EMAIL_*` | Reserved for Stage 2 integrations (unused today) |

No secrets are committed to the repository.

---

## Deploying a shareable demo (Render)

The repo includes a `render.yaml` Blueprint.

1. Sign in at https://render.com (free) and connect your GitHub account.
2. **New → Blueprint** → choose this repository and the branch to deploy → **Apply**.
3. Wait for the first build (~3–5 min). Your link will look like `https://northline-prototype.onrender.com`.

Notes:
- The free plan sleeps after ~15 min of inactivity; the first visit afterwards takes ~30–60 s to wake. Open the link a minute before a meeting.
- Free instances use temporary storage, so demo data resets to the original seed on each restart or redeploy. For permanent changes, use a paid plan with the disk block in `render.yaml`.
- `SESSION_SECRET` is generated automatically; the public URL is detected automatically (`RENDER_EXTERNAL_URL`). To use a custom domain, set `NEXT_PUBLIC_SITE_URL`.
- Demo mode stays on (presenter toolbar + demo logins). Anyone with the link can sign in with the demo accounts — share it only with the client.

---

## Demo accounts & presenting

All demo accounts use the password **`Demo1234`**. Emails use the reserved `example.com` domain.

| Persona | Email | What to show |
| --- | --- | --- |
| Regular customer | `jordan.avery@example.com` | Retail pricing, dashboard with orders, quotes, uploaded files |
| Approved contractor | `priya.raman@example.com` | Contractor prices on eligible products ("Contractor price" label) |
| Pending contractor | `marcus.bell@example.com` | Retail pricing + "application under review" notices |
| Rejected contractor | `elena.novak@example.com` | Retail pricing, rejection reason on status page |
| Administrator | `admin@example.com` | Full admin dashboard |
| Staff (limited) | `taylor.kim@example.com` | Admin with orders/quotes/customers permissions only |

**Presenter toolbar:** in demo mode a *Demo* button (bottom-right) switches personas in one click and resets data between meetings. The sign-in page also lists demo accounts (click to fill).

**Test payments:** card `4242 4242 4242 4242` (any future expiry, any CVC) succeeds; `4000 0000 0000 0002` is declined; `4000 0000 0000 9995` shows insufficient funds. Apple Pay / Google Pay open a simulated wallet sheet; Interac e-Transfer creates an order awaiting payment with instructions.

**Delivery postal codes (placeholder zones):** `L5A 1B2` (Local, $79), `M4C 1A1` (Metro, $119), `N2L 3G1` (Extended, $169). Anything else (e.g. `V6B 1A1`) is outside the delivery area. More than 6 oversized units (doors, vanities, shower bases…) → *delivery fee to be confirmed*.

### Suggested demo script

1. **Homepage → category → product**: show stock states, sale pricing, the square-footage calculator (Harbour Oak SPC), variations (Coastline SPC colours recolour the images).
2. **Cart → checkout** as a guest: delivery vs pickup, postal-code fee, preferred date, test card, confirmation.
3. **Cart → "Request quote for this cart"** and the **Free Quote** form with a PDF/photo upload → reference `Q-2026-00NN`.
4. **Contractor journey**: apply at `/contractors/apply` → pending status → switch to *Administrator* → *Contractor applications* → approve → switch back → contractor prices appear.
5. **Admin**: edit a product price/stock (Pricing & Inventory tables or product editor) and show the storefront update; open a quote, set it to *Quoted* with an amount, then show it in Jordan's dashboard; browse the email-notification log.

---

## Stack & architecture

- **Next.js 16 (App Router) + React 19 + TypeScript**, server components by default, server actions for mutations
- **Tailwind CSS v4** with a locked design-token palette (`src/app/globals.css`) — the default Tailwind colour palette is disabled so only approved tokens can be used
- **Zod** validation (shared client/server schemas), **lucide-react** icons (single icon set)
- **Vitest** unit tests, **Playwright** end-to-end tests
- Fonts: Inter (body) and Barlow (display) via `next/font` (self-hosted at build)

```
src/
  app/
    (store)/            Storefront routes (home, shop, products, cart, checkout, quote, contractors, account…)
    admin/              Admin dashboard routes (guarded server-side)
    actions/            Server actions: auth, cart, checkout, quote, contractor, account, admin
    api/uploads/        File upload + authorised download
    media/              Generated placeholder imagery and spec-sheet PDFs
  components/           UI grouped by area (ui, layout, product, cart, checkout, forms, account, admin, home, catalog)
  config/               business.ts (placeholders), site.ts (navigation), env.ts
  data/seed/            Structured demo data (categories, products, people, orders/quotes, settings)
  lib/                  Pure domain logic: pricing, stock, calculator, cart/delivery, catalogue filters, validation, types
  server/
    db.ts               Prototype JSON data store (swap for a real DB in Stage 2)
    auth/               Password hashing (scrypt) and signed-cookie sessions
    services/           Catalogue, email, payments, uploads, notifications
    art/                Placeholder illustration + PDF generators
tests/
  unit/                 Vitest
  e2e/                  Playwright journeys A–G, responsive and console checks
```

**Layering:** UI → server actions → services/lib → `server/db.ts`. Business rules (pricing, delivery, validation) live in `src/lib` as pure, tested functions. Replacing the JSON store with Postgres (Prisma/Drizzle) means re-implementing `getDb`/`mutate` and the services, not the UI.

### Demo data strategy

`src/data/seed` builds the database from compact structured definitions (≈60 products across all 11 categories, 10 customers covering every contractor state, 12 orders, 9 quotes, uploaded-file metadata, contact messages and notification history). Dates are relative to "now" so the demo always looks current. The seed is written to `DATA_DIR/db.json` on first run. If the directory isn't writable (e.g. serverless hosting) the store falls back to in-memory mode.

---

## How key features work

### Contractor pricing

- Every product has `retail`, `sale`, `contractor` prices and a `visibility` of `public`, `contractors_only` or `hidden` (`src/lib/types.ts`).
- `resolvePrice()` in `src/lib/pricing.ts` decides what a viewer sees. **Only** accounts with `accountType: "contractor"` **and** `contractorStatus: "approved"` receive contractor prices. Guests, regular customers and pending/rejected contractors always get retail/sale pricing.
- Approved contractors get the lower of their contractor price and an active sale price.
- No retail price or `hidden` visibility → *Request a Quote*. `contractors_only` → quote for everyone except approved contractors.
- Pricing is resolved **on the server**. Pages and cart snapshots receive a `ProductView` with only the resolved `price` — the raw pricing object and contractor price never reach the browser for unauthorised viewers. Cart and checkout re-price on the server; browser-supplied prices are never trusted.
- The session cookie only holds a signed user id; role and contractor status are re-read on every request, so an approval takes effect on the next page load.
- A single `pricingTier` field is reserved on users for future multiple tiers or customer-specific pricing.

### Quote flow

1. Visitors (guest or signed in) submit `/quote` — directly, from a product (`?product=slug`) or from the cart (`?from=cart`, cart items imported; the cart is kept).
2. Files upload individually to `/api/uploads` (extension, size **and** file-signature checks; stored outside `public/` with random names).
3. `submitQuoteAction` validates input, allocates the next reference (`Q-YYYY-NNNN`, per-year sequence), links uploads, attaches the quote to the signed-in account, and sends (simulated) customer + admin emails.
4. Staff manage it in **Admin → Quote requests** (Submitted → Under Review → Additional Info Required → Quoted → Approved/Declined). Status changes are emailed (simulated) and appear in the customer's dashboard.

### Checkout, delivery & payments

- Pickup (free, location details and readiness from settings) or delivery (postal-code zone matching, fee, free-over threshold, oversized → fee TBC, preferred date "subject to confirmation").
- HST is configurable in **Admin → Delivery settings** (placeholder 13%).
- Payments go through a `PaymentProvider` interface (`src/server/services/payments.ts`). The prototype uses a demo provider; the browser "tokenises" test cards so raw card numbers never reach the server — mirroring hosted payment fields in production.

### Email notifications

`sendNotification()` renders every email (registration, contractor application/decision, quotes, orders, contact form) and records it in the notification log (**Admin → Email notifications**) instead of sending. Each template can be toggled on/off.

### Analytics

`src/components/analytics.tsx` loads GA4 / Meta Pixel only when IDs are configured. `track()` (`src/lib/analytics.ts`) already fires `add_to_cart`, `begin_checkout`, `purchase`, `generate_lead`, `sign_up` and `search`.

---

## Where to change things

| What | Where |
| --- | --- |
| Business name, phone, email, address, hours, social links | `src/config/business.ts` |
| Colours, radius, shadows, typography | `src/app/globals.css` (`@theme` tokens) |
| Logo | `src/components/layout/logo.tsx` |
| Navigation & footer links, departments | `src/config/site.ts` |
| Products & categories (seed) | `src/data/seed/products.ts`, `src/data/seed/categories.ts` — or edit live in Admin |
| Delivery zones, pickup locations, tax | Admin → Delivery / Pickup settings (defaults in `src/data/seed/settings.ts`) |
| Announcement bar & promo tiles | Admin → Promotional banners |
| Homepage hero / section copy | Admin → Website content |
| Policies (placeholder copy) | `src/app/(store)/policies/[slug]/page.tsx` |
| Demo accounts | `src/data/seed/people.ts` |

After editing seed files run `npm run demo:reset` (or use the toolbar) so the database re-seeds.

---

## Testing & QA status

- **Unit (Vitest, 48 tests):** pricing visibility and contractor authorisation, sale behaviour, variant adjustments, browser-safe product views (no contractor-price leakage), cart and delivery calculations, tax, square-footage/waste calculator, quote references, stock states, validation, demo card tokenisation, upload rules, seed integrity.
- **End-to-end (Playwright, 26 tests):** journeys A–G (guest checkout incl. declined card, e-Transfer pickup, free quote with upload + rejected file type, cart-to-quote, registration + dashboard, contractor application → admin approval → contractor pricing, rejected contractor, admin price/stock edit, hidden price, admin quote status → customer view, admin route protection, staff permission enforcement), console-error checks on key routes, filters, empty states, mobile navigation, and horizontal-overflow checks at 375/390/430/768/1024/1280/1440 px.

## Prototype limitations

- **Reference site not inspected:** the reference URL (`nkflooring.pplx.app`) was blocked by the build environment's network policy and no screenshots were supplied, so the visual design follows the brief and approved colour tokens rather than a direct comparison. A visual pass against the reference is listed in `PRODUCTION_TODO.md`.
- Data is a JSON file (single server instance); not suitable for concurrent production traffic.
- Payments, emails and SMS are simulated; no real charges or messages are sent.
- Product images are generated SVG illustrations; spec sheets are generated placeholder PDFs.
- Password reset, 2-step verification, saved products, invoices, payment history and reorder are shown as "coming soon".
- Uploads are stored on local disk without virus scanning.
- Admin permissions are basic (admin vs staff with section permissions).

See **[PRODUCTION_TODO.md](./PRODUCTION_TODO.md)** for the Stage 2 checklist.
