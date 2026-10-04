# Production TODO

Checklist for taking the Stage 1 prototype to a live store. It is grouped by area and follows the order in [PHASE_2_PLAN.md](./PHASE_2_PLAN.md).
**Last reviewed:** 2026-09-28 (Stage 1 audit).

**Each item has a marker:**

| Marker | Meaning |
| --- | --- |
| **[DEV]** | Can do without client info — the developer can do it now |
| **[CLIENT]** | Requires client info or decisions (see [CLIENT_INFORMATION_REQUIRED.md](./CLIENT_INFORMATION_REQUIRED.md)) |
| **[3RD-PARTY]** | Requires third-party accounts or credentials (payment, email, storage, hosting, analytics) |

Items marked `[x]` are already done in Stage 1.

---

## 1. Client approval and revisions
- [x] **[DEV]** Stage 1 prototype built, deployed to Render and audited (see the README change log)
- [x] **[DEV]** Stage 1 audit: route crawl as each persona, mobile overflow fixes, date fix, contractor-price leak tests
- [ ] **[CLIENT]** Client reviews the live demo and features guide (`docs/Website-Features-Guide.pdf`)
- [ ] **[CLIENT]** Collect the revision list (copy, layout, colours, features to add or remove) in one written document
- [ ] **[DEV]** Apply the approved revisions without changing established journeys; re-run all tests
- [ ] **[CLIENT]** Written sign-off on Stage 1 (scope freeze for Phase 2)
- [ ] **[DEV]** Tag the approved commit: `git tag stage1-approved && git push origin stage1-approved`
- [ ] **[CLIENT]** Visual comparison with the reference site (`nkflooring.pplx.app`). It was blocked by the build environment's network policy, so the client should send screenshots or confirm it no longer matters

## 2. Final business information
- [ ] **[CLIENT]** Legal business name, trading name, logo files (SVG/PNG), brand guidelines
- [ ] **[CLIENT]** Address(es), phone, email, hours, holiday hours, map location
- [ ] **[CLIENT]** Pickup locations (address, hours, instructions, ready times)
- [ ] **[CLIENT]** Delivery zones (postal-code prefixes), fees, free-delivery thresholds, lead times, oversized-item rules
- [ ] **[CLIENT]** Tax setup (HST 13% Ontario only, or multi-province GST/PST/HST)
- [ ] **[CLIENT]** Social media links
- [ ] **[DEV]** Put the final values into `src/config/business.ts` and the settings seed; set `isPlaceholder: false`
- [ ] **[DEV]** Replace the placeholder logo (`src/components/layout/logo.tsx`), the app icon (`src/app/icon.svg`) and add an Open Graph image

## 3. Catalogue and content
- [ ] **[CLIENT]** Full product list (name, SKU, category, brand, description, specs, prices: retail, sale, contractor; units, coverage per box, variants, stock, lead times)
- [ ] **[CLIENT]** Product photos (high resolution, rights cleared) and spec sheets, installation guides, warranty documents
- [ ] **[CLIENT]** Confirm the 11 categories and subcategories, and which products are "contractors only" or "request a quote"
- [ ] **[CLIENT]** Homepage copy, About Us, banners and promotions
- [ ] **[DEV]** CSV/Excel import tool for products (to the database) with validation report
- [ ] **[DEV]** Switch product `<img>` to `next/image` with configured `remotePatterns`; re-enable the `@next/next/no-img-element` lint rule
- [ ] **[DEV]** Remove the generated SVG art and placeholder PDFs once real media is loaded

## 4. Database
- [ ] **[DEV]** Choose ORM (Drizzle recommended) and write the schema from `src/lib/types.ts`
- [ ] **[CLIENT]** Approve the hosting and cost proposal in [HOSTING_AND_COSTS.md](./HOSTING_AND_COSTS.md): no monthly platform subscriptions; annual billing where practical
- [ ] **[DEV]** Self-hosted PostgreSQL on the approved VPS (no managed database subscription)
- [ ] **[CLIENT]** Agree **post-launch maintenance responsibility** in writing (maintenance agreement or accepted risk). See HOSTING_AND_COSTS.md section 7
- [ ] **[CLIENT]** Open every production account (domain, OVHcloud, Cloudflare, Stripe, AWS/email, Google) **in the business's name** with 2FA, and invite the developer as a collaborator; transfer or share the code repository at handover
- [ ] **[DEV]** Repository layer replacing `getDb`/`mutate`; transactions for checkout (order + stock + payment) and for reference counters
- [ ] **[DEV]** Money stored as integer cents or `numeric(10,2)`; timestamps as `timestamptz`
- [ ] **[DEV]** Seed script for staging (demo data) that is never run in production
- [ ] **[3RD-PARTY]** Automated backups and point-in-time restore; test a restore
- [ ] **[DEV]** Remove the JSON store and `DATA_DIR` once migrated

## 5. Authentication and security
- [x] **[DEV]** scrypt password hashing, HMAC-signed session cookie, server-side role/permission checks, contractor prices resolved on the server
- [x] **[DEV]** Security headers (nosniff, referrer policy, frame options, permissions policy)
- [ ] **[DEV]** Password reset and email verification (needs the email provider)
- [ ] **[DEV]** Rate limiting and lockout on login, register, quote, contact and upload endpoints
- [ ] **[3RD-PARTY]** Bot protection on public forms (Cloudflare Turnstile or hCaptcha keys)
- [ ] **[DEV]** Optional two-factor authentication for staff/admin
- [ ] **[DEV]** Audit log for admin actions (price changes, approvals, status updates)
- [ ] **[DEV]** Session revocation ("sign out everywhere"), session rotation on privilege change
- [ ] **[DEV]** Content-Security-Policy header (after analytics/payment scripts are known)
- [ ] **[DEV]** Turn off demo mode (`NEXT_PUBLIC_DEMO_MODE=false`), remove demo accounts from production data, and test that no demo UI appears
- [ ] **[DEV]** Set a strong `SESSION_SECRET` in production (never committed)
- [ ] **[CLIENT]** List of staff who need admin access and their permissions
- [ ] **[DEV]** Dependency audit (`npm audit`) and a basic penetration test before launch

## 6. File storage
- [x] **[DEV]** Upload validation: extension, 10 MB size limit, file-signature check, 8 files max, owner/staff-only download
- [ ] **[DEV]** Keep uploads on the VPS disk (private) and include them in encrypted off-site backups (Cloudflare R2 free allowance or the VPS backup add-on)
- [ ] **[DEV]** Storage adapter behind `storeUpload`/`readUpload`; signed, short-lived download URLs
- [ ] **[3RD-PARTY]** Malware scanning (e.g. ClamAV service or provider scanning)
- [ ] **[DEV]** Strip image metadata (EXIF/GPS) on upload
- [ ] **[CLIENT]** Retention period for quote attachments

## 7. Payments
- [x] **[DEV]** `PaymentProvider` interface, order flow, declined/insufficient-funds handling, e-Transfer "awaiting payment" flow
- [ ] **[CLIENT]** Choose provider and methods (card, Apple Pay, Google Pay, Interac e-Transfer, financing?)
- [ ] **[3RD-PARTY]** Merchant account with **no monthly fee** and API keys (sandbox + live), e.g. Stripe (2.9% + C$0.30 per domestic card payment)
- [ ] **[DEV]** Implement the provider; replace the demo card form with hosted fields / Payment Element
- [ ] **[DEV]** Webhooks (payment succeeded/failed, refunds), idempotency keys, reconciliation view in admin
- [ ] **[3RD-PARTY]** Apple Pay domain verification
- [ ] **[CLIENT]** e-Transfer recipient email and instructions; refund policy
- [ ] **[DEV]** Remove the demo tokenizer (`src/lib/demo-card.ts`) from production builds

## 8. Email
- [x] **[DEV]** Notification templates for every event, per-template on/off toggles, admin log
- [ ] **[CLIENT]** Sending address (e.g. orders@domain) and which staff inboxes receive admin alerts
- [ ] **[3RD-PARTY]** Amazon SES account on **pay-as-you-go ("à la carte")** pricing (about US$0.10 per 1,000 emails, no monthly fee), or SMTP details for the client's existing mailbox
- [ ] **[3RD-PARTY]** SPF, DKIM and DMARC DNS records on the sending domain
- [ ] **[DEV]** Implement `EmailProvider`; branded HTML templates; retry on failure
- [ ] **[CLIENT]** Newsletter/marketing platform (if any) and CASL consent wording

## 9. SEO
- [x] **[DEV]** Per-page metadata, `sitemap.xml`, `robots.txt`, product/breadcrumb/organisation JSON-LD (contractor prices excluded)
- [ ] **[CLIENT]** Target keywords and service area; existing website URLs (for redirects)
- [ ] **[DEV]** Final titles and descriptions per category and product; LocalBusiness JSON-LD with the real address
- [ ] **[DEV]** 301 redirects from any old site URLs
- [ ] **[3RD-PARTY]** Google Search Console verification (`NEXT_PUBLIC_GSC_VERIFICATION`) and sitemap submission
- [ ] **[3RD-PARTY]** Google Business Profile linked to the site

## 10. Analytics
- [x] **[DEV]** `track()` events: `add_to_cart`, `begin_checkout`, `purchase`, `generate_lead`, `sign_up`, `search`; GA4/Meta scripts load only when IDs are set
- [ ] **[3RD-PARTY]** GA4 measurement ID and Meta Pixel ID
- [ ] **[DEV]** Cookie-consent banner; load tracking only after consent
- [ ] **[DEV]** Verify events in GA4 DebugView and Meta Events Manager

## 11. Domain and DNS
- [ ] **[CLIENT]** Domain name and registrar access (or someone at the client who can add DNS records)
- [ ] **[3RD-PARTY]** DNS records for the site (A/CNAME), email (MX, SPF, DKIM, DMARC), verification TXT records
- [ ] **[DEV]** SSL (automatic on most hosts); set `NEXT_PUBLIC_SITE_URL`; `www` → apex redirect (or the reverse)

## 12. Deployment
- [x] **[DEV]** `render.yaml` Blueprint for the demo; auto-deploy on push to `claude/intelligent-edison-536z5s`
- [ ] **[DEV]** CI (GitHub Actions): lint, typecheck, unit, build, e2e on every PR
- [ ] **[3RD-PARTY]** Annually prepaid Canadian VPS in the business's name (see HOSTING_AND_COSTS.md); **not** a monthly platform such as paid Render, Vercel or Fly
- [ ] **[DEV]** Separate staging and production environments with their own env vars and databases
- [ ] **[DEV]** Production branch strategy (`main` for production, PR reviews), no direct pushes
- [ ] **[DEV]** Uptime monitoring (self-hosted Uptime Kuma and/or a free external monitor); error tracking optional (Sentry free tier) — no monthly plan
- [ ] **[DEV]** Health check endpoint; log retention

## 13. Legal and policies
- [ ] **[CLIENT]** Returns and exchange policy, delivery policy, warranty terms
- [ ] **[CLIENT]** Privacy policy (PIPEDA) and terms of sale, ideally reviewed by the client's lawyer
- [ ] **[CLIENT]** Contractor program terms (eligibility, payment terms, pricing confidentiality)
- [ ] **[DEV]** Put final policy text into `src/app/(store)/policies/[slug]/page.tsx` (or CMS content)
- [ ] **[DEV]** Cookie policy; CASL-compliant opt-in wording and consent records
- [ ] **[DEV]** Accessibility statement (AODA for Ontario businesses)

## 14. Final QA
- [x] **[DEV]** Stage 1: 51 unit tests and 44 Playwright tests (journeys, regression, pricing-leak matrix, 7 viewport widths) passing
- [ ] **[DEV]** Re-run the full suite against staging with the real database, payment sandbox and email sandbox
- [ ] **[DEV]** Cross-browser and device testing: Safari iOS, Chrome Android, Chrome, Firefox, Edge, Safari macOS
- [ ] **[DEV]** Accessibility audit (axe + keyboard + screen reader)
- [ ] **[DEV]** Performance (Lighthouse) with real images; image sizes and caching
- [ ] **[DEV]** Place real test orders with live payments, then refund them
- [ ] **[CLIENT]** User acceptance testing by the client's staff (admin workflows: products, pricing, inventory, orders, quotes, contractors)
- [ ] **[CLIENT]** Go-live date and launch sign-off

## Later / optional integrations
- [ ] **[CLIENT]** POS or inventory sync (products have `inventory.externalId` reserved)
- [ ] **[CLIENT]** Accounting export (QuickBooks, Xero)
- [ ] **[CLIENT]** CRM sync; SMS notifications (customers can already choose "text")
- [ ] **[CLIENT]** Multiple contractor pricing tiers or customer-specific pricing (`pricingTier` reserved)
- [ ] **[DEV]** Saved products, invoices, payment history and reorder in the customer dashboard (shown as "coming soon")
- [ ] **[3RD-PARTY]** Facebook/Instagram and Google Merchant product feeds
