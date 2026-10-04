# Hosting, infrastructure and running costs: proposal for approval

**Status:** PROPOSAL. Nothing in this document has been purchased, subscribed to or set up. Every paid item needs the client's approval first.
**Prepared:** 2026-10-04. Prices are estimates from public price lists at that date. Taxes are not included. Check each price at checkout.

---

## 1. Client requirement (applies to every infrastructure decision)

1. **Custom website, not a website builder.** Keep this custom-built site. Do not migrate to Shopify, Wix, Squarespace or similar.
2. **No mandatory monthly platform subscription.** No monthly e-commerce or website-builder plan.
3. **Annual billing where practical.** Pay reasonable yearly costs for the domain, hosting and other essentials.
4. **Minimal recurring third-party dependencies.**
5. **Free tiers only where they are genuinely fit for production.** Their limits and risks must be written down.
6. **Every paid service documented.** Record its cost and whether it is billed **monthly, annually, by usage or per transaction**.
7. **Payment-processing fees are separate.** They are acceptable and are not counted as a platform subscription.

---

## 2. Recommended stack (pending approval)

One annually prepaid virtual private server (VPS) runs everything: the website, the database and uploaded files. Encrypted backups go off-site every night. Everything the prototype simulates today is replaced by software we run ourselves, or by pay-per-use services with **no monthly fee**.

| Layer | Recommendation | Why |
| --- | --- | --- |
| Website / app | This Next.js app (already built), running on the VPS under Node.js 22 | No rebuild, no platform lock-in |
| Web server and SSL | **Caddy** reverse proxy with free automatic **Let's Encrypt** certificates | Free, renews automatically |
| Database | **PostgreSQL** on the same VPS, accessed through an ORM (Drizzle) | No managed-database subscription |
| Login / accounts | **Built-in** (already in the code: scrypt passwords, signed sessions). Phase 2 adds password reset and email verification | No authentication SaaS |
| File storage | **VPS disk**, private, served only to the owner or staff (already built). Included in the nightly backups | No storage subscription at this scale |
| Backups | Nightly database dump and uploads, encrypted, copied **off-site** (Cloudflare R2 free allowance, or the VPS provider's backup add-on), plus a documented restore test | Protects against server loss |
| Transactional email | **Amazon SES, pay-as-you-go ("à la carte")** behind the existing `EmailProvider` interface. *Alternative:* SMTP through the client's existing business mailbox | Charged by usage only, no monthly fee |
| Payments | **Stripe** (cards, Apple Pay, Google Pay) behind the existing `PaymentProvider` interface, plus the existing **Interac e-Transfer** manual flow | Per-transaction fees only, no monthly fee |
| DNS (and optional CDN) | **Cloudflare Free** plan, or the registrar's free DNS | Free; easy to move away |
| Spam protection on forms | **Cloudflare Turnstile** (free) | Free and unlimited on the standard plan |
| Uptime monitoring | **Uptime Kuma** (self-hosted, free) or the free tier of a hosted monitor | No subscription |
| Analytics | **Google Analytics 4** (free), loaded only after cookie consent | Free |
| Fonts | **Self-host Satoshi** on our own server (the ITF Free Font License permits web use; confirm the licence text before launch) | Removes the Fontshare dependency |
| Map | Google Maps **embed** (iframe, no API key) | Free |

**Data location:** choose a VPS in a **Canadian data centre** (for example Beauharnois, Quebec, or Toronto). PIPEDA does not strictly require Canadian hosting, but it keeps customer data in Canada and is easy to explain to customers.

---

## 3. Estimated recurring costs

### 3a. Fixed yearly costs

| Item | Suggested provider (alternatives) | Billing | Estimated cost | Notes |
| --- | --- | --- | --- | --- |
| Domain name (.ca) | A CIRA-certified registrar, e.g. CanSpace, Porkbun, Cloudflare or Dynadot | **Annual** (multi-year prepay possible) | **≈ $10–20 / year** | Renewal list prices of about $9–15 (e.g. Porkbun ≈ $9.17, Rebel C$11.99, Hostinger ≈ C$15). A .com costs about the same. Turn on auto-renew. |
| VPS server: 2 vCPU, 4 GB RAM, 40 GB+ SSD, Canadian data centre | OVHcloud VPS (Beauharnois, QC). Alternatives: another Canadian host offering 12-month prepay | **Annual prepay where offered**; otherwise a 12-month commitment billed monthly (*confirm at checkout*) | **≈ C$60–200 / year** | OVHcloud lists VPS-1 (2 vCores, 4 GB) **from about $4.54 a month**, roughly $55/year before tax and add-ons. Larger plans or other hosts land higher in the range. Annual-prepay terms were **not verified** (the provider's site was unreachable from our build environment). |
| Server backups / snapshots | VPS provider's backup add-on | Billed with the server | **≈ C$0–60 / year** | Optional if we use the off-site backups below. Recommended for extra safety. |
| **Fixed total** | | | **≈ C$75–280 / year** | Domain + server (+ optional backup add-on) |

### 3b. Usage-based costs (no monthly fee; pay only for what is used)

| Item | Provider | Billing | Estimated cost | Notes |
| --- | --- | --- | --- | --- |
| Transactional email (order, quote and account emails) | Amazon SES, **"à la carte" pay-as-you-go** | **Usage-based** | **≈ US$0.10 per 1,000 emails** → about **US$1–3 / year** at 1,000–2,000 emails a month | AWS added monthly SES plans in 2026 (Pro, Enterprise). Use the **à la carte** option, which has no monthly fee. Needs an AWS account with a card on file. Optional extras such as dedicated IPs have monthly fees, so **don't enable them**. |
| Off-site backup storage | Cloudflare R2 | **Usage-based** with a free monthly allowance | **US$0** within 10 GB; then US$0.015 per GB-month | A small store's database dumps and quote uploads should stay well under 10 GB for years. |

### 3c. Per-transaction costs (separate from hosting, as the client agreed)

| Item | Provider | Billing | Rate | Notes |
| --- | --- | --- | --- | --- |
| Card payments, Apple Pay, Google Pay | Stripe (Canada) | **Per transaction**, no monthly fee | **2.9% + C$0.30** per domestic card payment. International cards add **1.5%**. Currency conversion adds **1%** | Example: a C$500 order costs about **C$14.80** in fees. |
| Interac e-Transfer | The client's business bank account (manual, already built into checkout) | Per the client's bank plan | Depends on the bank | No integration fee. Staff mark orders as paid in the admin. |
| *Alternatives* | Helcim or Square (no monthly fee) | Per transaction | Varies | **Avoid** merchant plans with monthly terminal or platform fees. |

### 3d. Free services and their limits

| Service | Free plan limits | Risk | Fallback |
| --- | --- | --- | --- |
| Let's Encrypt (SSL) | Rate limits only; certificates renew every 90 days automatically | Very low; a standard choice | Any paid certificate |
| Cloudflare Free (DNS) | Production-grade DNS | Free-plan terms could change | Move DNS to the registrar (about 1 hour) |
| Cloudflare Turnstile | Unlimited challenges, up to 20 widgets | Low | hCaptcha free tier, or rate-limiting only |
| Cloudflare R2 | 10 GB stored, 1M writes and 10M reads a month free | Going past the allowance becomes paid usage (cents) | The VPS provider's backup add-on |
| Google Analytics 4 | Free for this size of business | Needs a cookie-consent banner | Simpler self-hosted analytics |
| Uptime Kuma | Self-hosted, free | Runs on the same server; can't alert if the whole server is down | Add a free external monitor such as UptimeRobot's free plan (*limits to confirm at sign-up*) |

### 3e. Optional (only if the client wants them)

| Item | Billing | Estimated cost | Notes |
| --- | --- | --- | --- |
| Staff email mailboxes (orders@, sales@) | Usually monthly or annual per user | Varies | Not needed for the website. Many businesses already have Google Workspace or Microsoft 365. If not, choose a provider that offers **annual billing**. We will confirm the price before recommending one. |
| Error tracking (e.g. Sentry) | Free developer tier, then monthly | US$0 on the free tier | Optional. Server logs plus uptime monitoring are enough at launch. |

### Summary

| | Estimate |
| --- | --- |
| **Fixed yearly costs** | **≈ C$75–280 / year** (domain + server, plus an optional backup add-on) |
| Usage-based | ≈ US$1–5 / year (email, backup storage) |
| Per transaction | 2.9% + C$0.30 per card payment (Stripe) |
| **Mandatory monthly platform subscription** | **None** |

---

## 4. Options considered and not recommended

| Option | Why not |
| --- | --- |
| Shopify, Wix, Squarespace, BigCommerce | Mandatory monthly subscription; would mean rebuilding the site and locking the client into the platform |
| Render paid plan (where today's demo runs) | Billed **monthly** (web service from US$7/month, Postgres extra) |
| Render free plan | Fine for the **demo only**: it sleeps after 15 minutes idle, files are temporary, and the free Postgres database is **deleted after 30 days** |
| Vercel Hobby / Pro | Hobby is for non-commercial use only; Pro is billed monthly per user |
| Managed databases (Neon, Supabase, RDS) | Paid tiers are monthly; free tiers pause or limit storage, which is unsuitable for a shop's orders |
| Authentication SaaS (Clerk, Auth0) | Monthly plans; login is already built into the site |
| Postmark, Resend, SendGrid | Their useful plans are monthly; SES à la carte has no monthly fee |
| Shared cPanel hosting | Cheap and annual, but running Next.js on it is unreliable; a VPS is the safer choice for the same yearly budget |

---

## 5. Trade-offs of self-hosting (the client should know)

- **Someone must look after the server.** That means applying security updates, checking that backups work and watching uptime (SSL renews itself). This is **labour, not a subscription**. It can be covered by a small annual maintenance agreement with the developer, or done in-house. We would set up automatic security updates, nightly backups and alerts so routine care takes only minutes a month.
- **One server is a single point of failure.** If the server fails, the site is down until it is restored from backup. With the documented restore process this takes about 1–2 hours. That is acceptable for a local store at this size; a second server can be added later.
- **Capacity.** A 2 vCPU / 4 GB server comfortably handles a catalogue of 50–100 products, local traffic, and an admin team of a few people. Upgrading is a quick plan change.

---

## 6. What changes in the code (Phase 2, after approval only)

1. PostgreSQL + Drizzle, replacing the JSON demo store (`src/server/db.ts`).
2. Deployment files: a Dockerfile or systemd service, a Caddyfile, nightly backup and restore scripts, and a server setup checklist.
3. An Amazon SES adapter behind `EmailProvider`, plus SPF, DKIM and DMARC records.
4. A Stripe adapter behind `PaymentProvider` (hosted card fields, webhooks, refunds).
5. Self-hosted Satoshi font files, removing the Fontshare request.
6. Keep `render.yaml` for the **demo only** until launch.

---

## 7. Decisions needed from the client

- [ ] Approve the self-hosted VPS approach and the estimated yearly budget (≈ C$75–280/year + usage + transaction fees)
- [ ] Choose a domain name and registrar (or confirm the domain they already own)
- [ ] Approve a Canadian VPS provider and plan (confirm the annual-prepay terms at checkout)
- [ ] Approve Stripe (or name another provider with no monthly fee)
- [ ] Approve Amazon SES pay-as-you-go for website emails (or provide SMTP details for an existing mailbox)
- [ ] Decide who maintains the server (maintenance agreement or in-house)
- [ ] Confirm all accounts are opened **in the business's name**, with the developer invited as a user

**Sources checked (2026-10-04):** Stripe Canada fees ([profitvana.com](https://www.profitvana.com/guides/stripe-fees-in-canada), [affonso.io](https://affonso.io/resources/stripe-fee-calculator/canada)); Amazon SES pricing ([mailblast.io](https://www.mailblast.io/blog/ses/amazon-ses-pricing), [emailplatformreview.com](https://www.emailplatformreview.com/blog/amazon-ses-pricing-official-2026/)); .ca registrar prices ([cybernews.com](https://cybernews.com/best-domain-registrars/best-canadian-domain-registrars/), [CIRA](https://www.cira.ca/en/resources/documents/domains/registrar-fees-list/)); OVHcloud VPS Canada ([ovhcloud.com](https://www.ovhcloud.com/en-ca/vps/vps-canada/)); Cloudflare R2 and Turnstile ([developers.cloudflare.com](https://developers.cloudflare.com/turnstile/plans/), [mecanik.dev](https://mecanik.dev/en/posts/cloudflare-r2-pricing-explained-real-costs-vs-s3-and-backblaze/)); Render plans ([justinmckelvey.com](https://justinmckelvey.com/blog/is-render-free), [srvrlss.io](https://www.srvrlss.io/provider/render/)). Third-party summaries were used where official pages were unreachable; confirm on each provider's own site before purchase.
