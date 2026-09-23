import { expect, test } from "@playwright/test";
import { login, logout, watchConsole } from "./helpers";

test.describe.configure({ mode: "serial" });

test("A — guest: home → category → product → cart → checkout → confirmation", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Building materials");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Vinyl Flooring" }).click();
  await expect(page).toHaveURL(/\/shop\/vinyl/);
  await expect(page.getByRole("heading", { level: 1, name: "Vinyl Flooring" })).toBeVisible();

  await page.getByRole("link", { name: "Maple Mist Luxury Vinyl Plank" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Maple Mist Luxury Vinyl Plank");
  await expect(page.getByText("$54.99").first()).toBeVisible();

  // Use the calculator to set quantity, then add to cart.
  await page.getByRole("button", { name: /^Use \d+ boxes$/ }).click();
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  const drawer = page.getByRole("dialog", { name: /Your cart/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Maple Mist Luxury Vinyl Plank")).toBeVisible();
  await drawer.getByRole("link", { name: "Checkout" }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("guest.buyer@example.com");
  await page.getByLabel("Full name").fill("Guest Buyer");
  await page.getByRole("textbox", { name: /^Phone/ }).fill("555 010 7777");
  await page.getByRole("radio", { name: /Delivery/ }).check();
  await page.getByRole("textbox", { name: /^Street address/ }).first().fill("25 Test Street");
  await page.getByRole("textbox", { name: /^City/ }).first().fill("Your City");
  await page.getByRole("textbox", { name: /Postal code/ }).first().fill("L5A 1B2");
  await page.getByRole("textbox", { name: /Postal code/ }).first().blur();
  await expect(page.getByText(/Local Delivery —/).first()).toBeVisible();

  // Declined card first.
  await page.getByLabel("Card number").fill("4000 0000 0000 0002");
  await page.getByLabel("Expiry (MM / YY)").fill("1230");
  await page.getByLabel("Security code").fill("123");
  await page.getByRole("button", { name: /Place order/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "declined" })).toBeVisible();

  // Then a successful test card.
  await page.getByLabel("Card number").fill("4242 4242 4242 4242");
  await page.getByRole("button", { name: /Place order/ }).click();
  await expect(page).toHaveURL(/\/checkout\/confirmation\//);
  await expect(page.getByRole("main").getByText("Order confirmed", { exact: true })).toBeVisible();
  await expect(page.getByText(/NL-\d+/).first()).toBeVisible();
  await expect(page.getByText("Visa ending 4242").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("A2 — pickup checkout with Interac e-Transfer", async ({ page }) => {
  await page.goto("/products/contour-lever-passage-set");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.getByRole("dialog", { name: /Your cart/ }).getByRole("link", { name: "Checkout" }).click();
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("pickup@example.com");
  await page.getByLabel("Full name").fill("Pat Pickup");
  await page.getByRole("textbox", { name: /^Phone/ }).fill("555 010 8888");
  await page.getByRole("textbox", { name: /^Street address/ }).fill("9 Billing Road");
  await page.getByRole("textbox", { name: /^City/ }).fill("Your City");
  await page.getByRole("textbox", { name: /Postal code/ }).fill("L4T 2R8");
  await page.getByRole("radio", { name: /Interac e-Transfer/ }).check();
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByText("Complete your Interac e-Transfer").first()).toBeVisible();
  await expect(page.getByText("Awaiting e-Transfer").first()).toBeVisible();
});

test("B — free quote with file upload → reference number", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Free Quote" }).first().click();
  await expect(page).toHaveURL(/\/quote/);
  await page.getByLabel("Full name").fill("Quinn Quote");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("quinn@example.com");
  await page.getByRole("textbox", { name: /^Phone/ }).fill("555 010 9999");
  await page.getByLabel("Project address").fill("12 Project Lane, Your City");
  await page.getByLabel("Products required").fill("Vinyl flooring for a 600 sq. ft. basement and 13 stair treads");
  await page.getByLabel("Measurements / square footage").fill("Basement 30 x 20 ft");
  await page.getByText("Yes — please quote installation").click();

  // Rejected file type, then a valid PDF.
  await page.getByLabel("Upload project files").setInputFiles({ name: "virus.exe", mimeType: "application/octet-stream", buffer: Buffer.from("MZ") });
  await expect(page.getByText(/isn't a supported file type/).first()).toBeVisible();
  await page.getByLabel("Upload project files").setInputFiles({ name: "floor-plan.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n% demo\n") });
  await expect(page.getByText("floor-plan.pdf").first()).toBeVisible();
  await expect(page.getByText("Uploading…")).toHaveCount(0);

  await page.getByRole("button", { name: "Submit quote request" }).click();
  await expect(page).toHaveURL(/\/quote\/confirmation\//);
  await expect(page.getByText(/Q-\d{4}-\d{4}/).first()).toBeVisible();
  await expect(page.getByText(/1 file attached/).first()).toBeVisible();
});

test("B2 — quote form shows validation errors", async ({ page }) => {
  await page.goto("/quote");
  await page.getByRole("button", { name: "Submit quote request" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await expect(page.getByText("Full name is required").first()).toBeVisible();
});

test("C — cart → request quote for cart", async ({ page }) => {
  await page.goto("/products/soft-close-elongated-toilet-seat");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.keyboard.press("Escape");
  await page.goto("/products/wi-fi-keypad-smart-deadbolt");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.keyboard.press("Escape");
  await page.goto("/cart");
  await expect(page.getByText("Soft-Close Elongated Toilet Seat").first()).toBeVisible();
  await page.getByRole("link", { name: "Request quote for this cart" }).click();
  await expect(page.getByRole("heading", { name: "Request a quote for your cart" })).toBeVisible();
  await expect(page.getByText("Items from your cart", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("main").getByText("Wi-Fi Keypad Smart Deadbolt", { exact: true })).toBeVisible();
  await page.getByLabel("Full name").fill("Casey Cart");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("casey@example.com");
  await page.getByRole("textbox", { name: /^Phone/ }).fill("555 010 1212");
  await page.getByLabel("Project address").fill("Your City, ON");
  await page.getByRole("button", { name: "Submit quote request" }).click();
  await expect(page.getByText(/Q-\d{4}-\d{4}/).first()).toBeVisible();
  // Cart is preserved.
  await page.goto("/cart");
  await expect(page.getByText("Wi-Fi Keypad Smart Deadbolt").first()).toBeVisible();
});

test("D — register → dashboard sections", async ({ page }) => {
  await page.goto("/account/register");
  await page.getByLabel("Full name").fill("Robin Register");
  await page.getByRole("textbox", { name: /^Phone/ }).fill("555 010 3434");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("robin.register@example.com");
  await page.getByLabel(/^Password/).fill("Robin12345");
  await page.getByLabel("Confirm password").fill("Robin12345");
  await page.getByRole("textbox", { name: /^Street address/ }).fill("77 New Home Road");
  await page.getByRole("textbox", { name: /^City/ }).fill("Your City");
  await page.getByRole("textbox", { name: /Postal code/ }).fill("L6H 3P2");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/account\?welcome=1/);
  await expect(page.getByRole("heading", { name: "Hi, Robin" })).toBeVisible();

  const nav = page.getByRole("navigation", { name: "Account" });
  for (const [link, heading] of [
    ["Personal & company", "Personal & company details"],
    ["Addresses", "Addresses"],
    ["Orders", "Orders"],
    ["Quotes", "Quotes"],
    ["Project files", "Project files"],
    ["Settings & security", "Settings & security"],
  ]) {
    await nav.getByRole("link", { name: link }).click();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  }
  await expect(page.getByText("Planned for the production release.").first()).toBeVisible();
  await logout(page);
});

test("D2 — demo customer sees seeded orders, quotes and files", async ({ page }) => {
  await login(page, "jordan.avery@example.com");
  await expect(page).toHaveURL(/\/account$/);
  await page.getByRole("navigation", { name: "Account" }).getByRole("link", { name: "Orders" }).click();
  await expect(page.getByRole("link", { name: /NL-\d+/ }).first()).toBeVisible();
  await page.getByRole("link", { name: /NL-\d+/ }).first().click();
  await expect(page.getByRole("heading", { name: "Status history" })).toBeVisible();
  await page.goto("/account/files");
  await expect(page.getByText("kitchen-floor-plan.pdf").first()).toBeVisible();
});

test("E — contractor application → admin approval → contractor pricing", async ({ page }) => {
  const product = "/products/harbour-oak-rigid-core-spc-plank";
  const email = `terry.trade.${Date.now()}@example.com`;
  const company = `Trade Test Co. ${Date.now() % 100000}`;
  await page.goto("/contractors/apply");
  await page.getByLabel("Contact name").fill("Terry Trade");
  await page.getByRole("textbox", { name: /^Phone/ }).fill("555 010 4545");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Company / business name").fill(company);
  await page.getByLabel("Business type").selectOption("Flooring installer");
  await page.getByRole("textbox", { name: /^Street address/ }).fill("5 Industrial Way");
  await page.getByRole("textbox", { name: /^City/ }).fill("Your City");
  await page.getByRole("textbox", { name: /Postal code/ }).fill("L7A 1E4");
  await page.getByLabel(/^Password/).fill("Trade12345");
  await page.getByLabel("Confirm password").fill("Trade12345");
  await page.getByText("I confirm these details are accurate").click();
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByRole("heading", { name: "Your application is awaiting approval" })).toBeVisible();

  // Pending contractor: retail/sale price only.
  await page.goto(product);
  await expect(page.getByText("Your contractor application is under review").first()).toBeVisible();
  await expect(page.getByText("$64.99")).toHaveCount(0);
  await logout(page);

  // Admin approves.
  await login(page, "admin@example.com");
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("navigation", { name: "Admin" }).getByRole("link", { name: /Contractor applications/ }).click();
  await page.getByRole("link", { name: company }).click();
  await page.getByLabel("Decision note").fill("Welcome aboard");
  await page.getByRole("button", { name: "Approve contractor" }).click();
  await expect(page.getByText(/Approved — contractor pricing is now active/).first()).toBeVisible();
  await page.goto("/admin/emails");
  await expect(page.getByText("Your contractor account is approved").first()).toBeVisible();
  await logout(page);

  // Contractor now sees contractor pricing.
  await login(page, email, "Trade12345");
  await page.goto(product);
  await expect(page.getByText("Contractor price").first()).toBeVisible();
  await expect(page.getByText("$64.99").first()).toBeVisible();
  await logout(page);

  // Guests never see it.
  await page.goto(product);
  await expect(page.getByText("$64.99")).toHaveCount(0);
});

test("E2 — rejected contractor keeps retail pricing", async ({ page }) => {
  await login(page, "elena.novak@example.com");
  await page.goto("/products/harbour-oak-rigid-core-spc-plank");
  await expect(page.getByText("Contractor price")).toHaveCount(0);
  await expect(page.getByText("$69.99").first()).toBeVisible();
});

test("F — admin edits product price and stock → storefront updates", async ({ page }) => {
  await login(page, "admin@example.com");
  await page.goto("/admin/products?q=Maple");
  await page.getByRole("link", { name: /Maple Mist Luxury Vinyl Plank/ }).click();
  await page.getByLabel("Retail price ($)").fill("49.5");
  await page.getByLabel("Stock status").selectOption("low_stock");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Product saved — the storefront has been updated.").first()).toBeVisible();
  await logout(page);
  await page.goto("/products/maple-mist-luxury-vinyl-plank");
  await expect(page.getByText("$49.50").first()).toBeVisible();
  await expect(page.getByText("Low Stock").first()).toBeVisible();
});

test("F2 — admin hides a price → Request a Quote on storefront", async ({ page }) => {
  await login(page, "admin@example.com");
  await page.goto("/admin/pricing");
  await page.getByLabel("Price visibility for Primed Pine Stair Riser — 48\"").selectOption("hidden");
  const row = page.getByRole("row").filter({ hasText: "Primed Pine Stair Riser" });
  await row.getByRole("button", { name: "Save" }).click();
  await expect(row.getByText("Saved")).toBeVisible();
  await logout(page);
  await page.goto("/products/primed-pine-stair-riser");
  await expect(page.getByRole("link", { name: "Request a Quote" }).first()).toBeVisible();
  await expect(page.getByText("Request a Quote", { exact: true }).first()).toBeVisible();
});

test("G — admin updates quote status → customer sees it", async ({ page }) => {
  await login(page, "admin@example.com");
  await page.goto("/admin/quotes?status=submitted");
  await page.getByRole("row").filter({ hasText: "Jordan Avery" }).getByRole("link").first().click();
  await expect(page.getByRole("heading", { name: "Requested products" })).toBeVisible();
  await expect(page.getByText("ensuite-measurements.pdf").first()).toBeVisible();
  const reference = (await page.getByRole("heading", { level: 1 }).textContent())!.replace("Quote ", "").trim();
  await page.getByLabel("Quote status").selectOption("quoted");
  await page.getByLabel("Quoted amount ($, before tax)").fill("1875");
  await page.getByLabel("Message to customer").fill("Includes delivery to the cottage.");
  await page.getByRole("button", { name: "Save quote" }).click();
  await expect(page.getByText(/Quote updated/).first()).toBeVisible();
  await logout(page);

  await login(page, "jordan.avery@example.com");
  await page.goto(`/account/quotes/${reference}`);
  await expect(page.getByText("Quoted").first()).toBeVisible();
  await expect(page.getByText("$1,875.00").first()).toBeVisible();
  await expect(page.getByText("Includes delivery to the cottage.").first()).toBeVisible();
});

test("admin area is protected from customers and guests", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/account\/login/);
  await login(page, "jordan.avery@example.com");
  await page.goto("/admin");
  await expect(page).toHaveURL(/denied=1/);
});

test("staff permissions are enforced on the server", async ({ page }) => {
  await login(page, "taylor.kim@example.com");
  await page.goto("/admin/orders");
  await expect(page.getByRole("heading", { level: 1, name: "Orders" })).toBeVisible();
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/admin\?denied=permission/);
  await expect(page.getByText(/doesn't include access/).first()).toBeVisible();
});
