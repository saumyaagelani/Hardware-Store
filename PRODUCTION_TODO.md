# Production TODO (Stage 2)

## Critical before launch
- [ ] Visual review against the approved reference site (`nkflooring.pplx.app`) — it could not be accessed during Stage 1; adjust spacing, typography and section order where they differ
- [ ] Replace all placeholder business details in `src/config/business.ts` and set `isPlaceholder: false`
- [ ] Final logo (`src/components/layout/logo.tsx`), favicon and Open Graph image
- [ ] Replace the JSON data store (`src/server/db.ts`) with a managed database (e.g. Postgres + Prisma/Drizzle); add migrations and backups
- [ ] Set `NEXT_PUBLIC_DEMO_MODE=false` (hides presenter toolbar and demo credentials) and remove/rotate demo accounts
- [ ] Set a strong `SESSION_SECRET`; serve over HTTPS only
- [ ] Final policies: returns, delivery, privacy (PIPEDA/CASL), terms

## Payments
- [ ] Choose provider (e.g. Stripe — Canadian merchant account) and implement `PaymentProvider` in `src/server/services/payments.ts`
- [ ] Replace the demo card form with hosted fields / Payment Element (Visa, Mastercard, Amex, Apple Pay, Google Pay); domain verification for Apple Pay
- [ ] Webhooks for payment confirmation, refunds and failures; idempotency keys
- [ ] Interac e-Transfer reconciliation workflow (mark paid in admin already exists via status update)
- [ ] Confirm tax handling per province (currently a single configurable rate)

## Authentication / security
- [ ] Password reset and email verification flows
- [ ] Rate limiting on login, registration, quote, contact and upload endpoints; CAPTCHA/turnstile on public forms
- [ ] Optional 2-step verification for staff accounts
- [ ] CSRF review for any non-server-action endpoints; security headers / CSP tightening
- [ ] Audit log for admin actions (price changes, approvals)
- [ ] Session revocation / "sign out everywhere"
- [ ] Penetration test and dependency audit

## Product / content migration
- [ ] Import the real catalogue (50–100 products) — CSV import tool or admin bulk editor
- [ ] Final product photography (switch `<img>` to `next/image` with `remotePatterns` and re-enable `@next/next/no-img-element`)
- [ ] Manufacturer spec sheets, installation guides and warranty documents (replace generated PDFs)
- [ ] Verified specifications, certifications and warranty terms (seed data is illustrative only)
- [ ] About Us copy, banners and homepage content

## Email
- [ ] Choose provider (Postmark, SendGrid, SES, Resend) and implement `EmailProvider` in `src/server/services/email.ts`
- [ ] Branded HTML templates for all notifications; SPF/DKIM/DMARC on the sending domain
- [ ] Email marketing integration for newsletter/opt-ins (CASL-compliant consent records)

## File storage
- [ ] Move uploads to object storage (S3 / R2 / Azure Blob) with private buckets and signed URLs
- [ ] Virus/malware scanning of uploads; image re-encoding to strip metadata
- [ ] Retention policy for quote attachments

## SEO
- [ ] Keyword research and final titles/descriptions per category and product
- [ ] Product JSON-LD review (reviews/ratings only if genuine), Organization/LocalBusiness data with the real address
- [ ] Submit sitemap (`/sitemap.xml`) in Google Search Console; set `NEXT_PUBLIC_GSC_VERIFICATION`
- [ ] Redirects from any existing site URLs

## Analytics
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_META_PIXEL_ID`
- [ ] Cookie consent banner before loading tracking scripts
- [ ] Verify ecommerce events (`add_to_cart`, `begin_checkout`, `purchase`, `generate_lead`) in GA4 DebugView

## Domain / deployment
- [ ] Choose hosting (Vercel/Netlify/Render/Fly or Node host) — note the prototype store needs a writable disk; production DB removes this
- [ ] Domain, DNS, SSL; `NEXT_PUBLIC_SITE_URL`
- [ ] Environment variables and secrets management; staging environment
- [ ] Error monitoring (e.g. Sentry) and uptime checks
- [ ] Google Maps embed (`business.mapUrl`) once the address is final

## Integrations (as required)
- [ ] POS / inventory sync (products carry `inventory.externalId`)
- [ ] QuickBooks / accounting export of orders
- [ ] CRM sync of customers, quotes and contractor accounts
- [ ] SMS notifications (customers can already choose "text")
- [ ] Facebook / Instagram product catalogue feed
- [ ] Additional contractor pricing tiers / customer-specific pricing (`pricingTier` reserved)
- [ ] Saved products, invoices, payment history, reorder (dashboard "coming soon")

## QA
- [ ] Re-run unit + e2e suites against the production database and payment sandbox
- [ ] Cross-browser testing (Safari iOS, Chrome Android, Firefox, Edge)
- [ ] Accessibility audit (axe + manual screen-reader pass)
- [ ] Performance budget / Lighthouse on key pages with real images
- [ ] Client UAT sign-off on all journeys
