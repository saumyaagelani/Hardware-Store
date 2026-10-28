# NK Flooring: your Shopify store, what you need to do

A step-by-step guide for the store owner / admin. No technical knowledge needed. Do the parts in order and tick the boxes as you go.

**Your store:** https://qhxy01-ae.myshopify.com
**Admin (where you work):** log in at https://admin.shopify.com
**Store password (while it's not public):** Shopify admin → **Online Store → Preferences**

---

## Part 1. What is already done for you

- All **77 products** are in the store, visible on the online store, and sorted into **12 collections** (Vinyl Flooring, Stairs, Doors, Locks & Door Hardware, Shower Bases, Shower Doors, Shower Accessories, Toilet Seats, Vanities, Plumbing, WPC Wall Panels, Deals) plus a **Featured products** collection for the homepage.
- Every product has a picture. These are **placeholder drawings**, except the 18 SG vinyl planks, which have the supplier's spec-sheet image.
- A new design called **"Horizon – Render look"** has been built. It matches the demo website: dark colours, gold buttons, same homepage, header and footer.
- **Quote** and **Contractor program** pages are created.
- Products marked "quote only" cannot be bought online. They show "Request a quote" instead of a price.

## Part 2. What is NOT done yet (this is your list)

| Not done | Why |
| --- | --- |
| Your real business details (name, address, phone, email, hours) | Only you have them. Everything shown now is a placeholder. |
| Choosing and paying for a Shopify plan | Billing must be done by you, the owner. |
| Payments (cards, Interac e-Transfer) | Needs your bank and identity details. |
| Sales tax (HST/GST/PST) | Needs your tax registration number. |
| Delivery prices and pickup details | Needs your real service area and prices. |
| Contractor pricing (trade accounts) | Needs your contractor prices and a few clicks in Shopify. |
| Store policies (returns, privacy, terms) | Need your wording and approval. |
| Real prices, stock levels and photos | The current ones are placeholders. |
| Your domain name (e.g. yourstore.ca) | Needs to be bought or connected by you. |

---

## Part 3. Step-by-step

### Step 1. Own your store and choose a plan
- [ ] Log in to Shopify admin with the **owner** email. The store must belong to the business, not to a developer or a marketing person.
- [x] You are on the **Basic** plan, at **C$49/month** as you told us. Check **Settings → Plan** to see your billing cycle. Shopify usually charges less per month if you pay for a year up front.
- [ ] Give your developer and marketing person access as **collaborators** (free): **Settings → Users → Security**, share the *collaborator request code*, then approve their request and choose what they can see. Marketing staff do not need Orders, Payments or Customers.

### Step 2. Enter your business details
- [ ] **Settings → Store details:** store name **NK Flooring**, address **1639 Marine Dr, Fort Erie, ON L2A 0C9**, phone number, store email (**hardwarestore2002@gmail.com**), currency **CAD**. (Shopify's own settings can't be changed by your developer, so type these in yourself.)
  - Use an email address your team checks every day. **Quote requests and contractor applications are emailed to the store email.**
- [ ] Update the details shown on the website itself (Shopify does not copy them over automatically):
  1. **Online Store → Themes → "Horizon – Render look" → Customize.**
  2. **Header:** phone number, announcement messages, logo.
  3. **Footer:** address, phone, email, opening hours, Facebook and Instagram links.
  4. **Homepage → "Visit us":** address, hours, phone. Type your address in the *Google Maps address* box to show a live map.
  5. Click **Save**.
- [ ] Upload your **logo** (Header → Logo image). Until you do, a placeholder gold "Northline" logo shows.

### Step 3. Set up sales tax
- [ ] **Settings → Taxes and duties → Canada.**
- [ ] Enter your tax registration number(s) and turn on tax collection for the provinces where you are registered. Ask your accountant if you are unsure.

### Step 4. Set up payments
- [ ] **Settings → Payments → Shopify Payments → Activate.** Shopify asks for your identity and business bank account. This lets customers pay by Visa, Mastercard, Amex, Apple Pay and Google Pay.
- [ ] **Interac e-Transfer (optional):** under *Manual payment methods*, create a custom method called "Interac e-Transfer". Instruction for customers: *"Send the order total to [your email] with your order number in the message. We'll process your order once payment arrives."*
  - When the money arrives, open the order and click **Mark as paid**. This is a manual step.
- [ ] Do a test order before launch (see Step 12).

### Step 5. Set up pickup and delivery
- [ ] **Settings → Shipping and delivery → Local pickup:** turn it on for your showroom/warehouse and set the "ready in…" time.
- [ ] **Local delivery:** create your delivery areas by postal-code prefix (for example `L4*`) with a price for each, and a free-delivery amount if you offer one.
  - The numbers currently on the website ($79, $119, $169 and so on) are **examples**. Replace them with yours here **and** in the homepage "Pickup & delivery" section (Customize → Homepage).
- [ ] **Large or oversized orders:** Shopify can't confirm a delivery fee automatically. Either mention it in your delivery policy, or create these orders yourself by hand (see Part 4, "Send an invoice").

### Step 6. Store policies
- [ ] **Settings → Policies:** fill in Refund, Privacy, Terms of service and Shipping. Use Shopify's templates as a start, then edit them to match how you work. Have a lawyer or your accountant check them if you can.

### Step 7. Look at the new design and publish it
- [ ] **Online Store → Themes.** Find **"Horizon – Render look"**, click **⋯ → Preview**, and click around: homepage, a category, a product, search, cart.
- [ ] Write down anything you want changed and send it to your developer.
- [ ] When you're happy, click **Publish**. Your old theme stays saved, and you can switch back at any time.

### Step 8. Check and fix your products
- [ ] **Products:** open each product and check its **price**, **description** and **stock quantity**. The current numbers are placeholders from the demo.
- [ ] Replace the placeholder pictures with your **real photos** (open a product → *Media* → add photos and delete the drawings).
- [ ] **Quote-only products** (tagged `quote-only`): these have price $0 and cannot be bought. That's on purpose. Leave the tag on anything that you price case by case.
- [ ] **Sale prices:** to put a product on sale, enter the new price in *Price* and the old price in *Compare-at price*, and add the tag `on-sale` so it appears in the **Deals** collection. When the sale ends, clear the compare-at price and remove the tag. Shopify does not end sales automatically.
- [ ] **Adding a new product:** **Products → Add product.** Set the *Product type* to one of your categories (for example "Doors"), and it joins the right collection by itself.

### Step 9. Quote requests
The website has a free-quote form at `/pages/quote`, plus "Request a quote" buttons on quote-only products.
- [ ] Watch the store email inbox. Each request arrives as an email with the customer's details and the products they asked about.
- [ ] Reply with your price. For a customer who wants to buy, create an invoice (see Part 4).
- [ ] Note: the form can't take file uploads. The page asks customers to email photos or plans to your store email.

### Step 10. Contractor (trade) pricing
This is the part that needs setting up in Shopify. Your developer can walk you through it. Here is the idea:
- [ ] Contractors apply at `/pages/contractors`. The application arrives by email.
- [ ] **To approve one:** **Customers → Companies → Add company**, add the person as a contact, and attach the company to your *Contractors* market. They get an email invite. Once signed in, they see contractor prices.
- [ ] **One-time setup:** **Settings → Customer accounts** (use the *new* customer accounts), then **Markets → Add a B2B market "Contractors"**, then **Catalogs → create a "Contractor prices" catalog.** Contractor prices come from the file `shopify/contractor-prices.csv`. Your developer imports them.
- [ ] To reject an application, simply don't create the company.
- [ ] Before launch, test this: a normal visitor and a customer who isn't a contractor must see **retail prices only**.

### Step 11. Emails customers receive
- [ ] **Settings → Notifications:** open "Order confirmation" and the other emails, check the wording and your business name, and send yourself a test.
- [ ] **Settings → Notifications → Sender email:** use a business address, not a personal one.

### Step 12. Test everything, then launch
Do all of these before you tell customers about the site. Shopify's **test mode** for payments lets you do this without real money.
- [ ] Place a test order with a card.
- [ ] Place a test order with Interac e-Transfer, and mark it paid.
- [ ] Test **pickup**, and test **delivery** using a postal code inside and outside your area.
- [ ] Open the site on your phone.
- [ ] Submit the quote form and the contractor form. Check the emails arrive.
- [ ] Check the contractor price test from Step 10.
- [ ] Look for leftover placeholders: "Northline", "(555) 010-0142", "example.com", "Your City", "Placeholder Avenue".
- [ ] **Remove the store password:** **Online Store → Preferences → Password protection → untick** and save. The site is now public.

### Step 13. Your own web address
- [ ] **Settings → Domains → Connect existing domain** (if you already own one) **or Buy new domain** (about C$15–20/year). Shopify shows you the steps.
- [ ] Choose which address is the main one, so visitors always land on it.

---

## Part 4. Day-to-day: how to run the store

**See and fulfil orders:** **Orders.** Click an order, then *Fulfill items* when it's ready for pickup or has been delivered. The customer is emailed.

**Mark an e-Transfer order as paid:** open the order → **Mark as paid**.

**Send an invoice (for quotes, phone orders, large deliveries):**
1. **Orders → Create order.** Add the products, the customer, and any shipping or discount.
2. Click **Send invoice.** The customer gets an email with a link to review and pay by card.
3. When they pay, it becomes a normal order.

For printable PDF invoices, the free **Shopify Order Printer** app adds a *Print* button on each order.

**Change stock:** **Products → Inventory.**

**Add a discount code:** **Discounts → Create discount.**

**Approve a contractor:** see Step 10.

**Update the homepage text or banners:** **Online Store → Themes → Customize.** Click a section and edit the text.

**Get help:** Shopify support is in the admin (the **?** icon, top right).

---

## Part 5. Costs to expect

| Item | About |
| --- | --- |
| Shopify **Basic** plan | C$49/month (your current price). A yearly plan usually costs less per month; check Settings → Plan. |
| Domain name | C$15–20 per year |
| Card payments (Shopify Payments) | 2.8% + 30¢ on Visa/Mastercard. Amex and international cards cost more. |
| Interac e-Transfer | No Shopify fee (your bank may charge) |
| Apps | None needed for this setup. Some optional apps are billed monthly. Ask before adding any. |

Prices exclude tax and can change. Confirm them at shopify.com/ca/pricing when you sign up.

---

## Part 6. What to send your developer

- [ ] Your logo files and your final business details (Step 2)
- [ ] Final delivery areas, prices and free-delivery amounts (Step 5)
- [ ] Your real product prices, stock and photos (Step 8)
- [ ] Your contractor price list (Step 10)
- [ ] A list of design changes after you've previewed the new theme (Step 7)
- [ ] Your approved policies (Step 6)
