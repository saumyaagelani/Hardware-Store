import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalOverflow, login, logout, watchConsole } from "./helpers";

/**
 * Stage 1 regression suite — flows not already covered by journeys.spec.ts,
 * plus the contractor-pricing leak matrix and a wider responsive sweep.
 */
test.describe.configure({ mode: "serial" });

// A resolved contractor price (`kind: "contractor"`) or a raw pricing object
// (`"contractor": 64.99`) anywhere in the HTML/RSC payload would be a leak.
const CONTRACTOR_PRICE_LEAK = /kind\\?":\s*\\?"contractor|\\?"contractor\\?":\s*\d/;
const pricingPages = [
  "/",
  "/shop/vinyl",
  "/shop/doors",
  "/shop/stairs",
  "/deals",
  "/search?q=door",
  "/products/harbour-oak-rigid-core-spc-plank",
  "/products/solid-red-oak-stair-tread",
  "/products/shaker-2-panel-pre-hung-interior-door",
  "/products/solid-core-sound-dampening-door-slab",
  "/quote?product=shaker-1-panel-interior-door-slab&qty=2",
];

async function payloadLeaks(page: Page) {
  const leaks: string[] = [];
  for (const path of pricingPages) {
    const res = await page.request.get(path);
    expect(res.status(), path).toBe(200);
    const body = await res.text();
    if (CONTRACTOR_PRICE_LEAK.test(body)) leaks.push(path);
  }
  return leaks;
}

for (const [persona, email] of [
  ["guest", null],
  ["regular customer", "jordan.avery@example.com"],
  ["pending contractor", "marcus.bell@example.com"],
  ["rejected contractor", "elena.novak@example.com"],
  ["staff (admin)", "admin@example.com"],
] as const) {
  test(`contractor prices never reach a ${persona}`, async ({ page }) => {
    if (email) await login(page, email);
    expect(await payloadLeaks(page)).toEqual([]);

    // Visible prices: retail only.
    await page.goto("/products/harbour-oak-rigid-core-spc-plank");
    await expect(page.getByText("$69.99").first()).toBeVisible();
    await expect(page.getByText("$64.99")).toHaveCount(0);
    await expect(page.getByText("Contractor price")).toHaveCount(0);

    // Contractor-only price visibility → no price at all.
    await page.goto("/products/solid-core-sound-dampening-door-slab");
    await expect(page.getByText("$389")).toHaveCount(0);
    await expect(page.getByText("$459")).toHaveCount(0);

    // Cart is re-priced on the server for the current viewer.
    await page.goto("/products/solid-red-oak-stair-tread");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.keyboard.press("Escape");
    await page.goto("/cart");
    // Default option is the 36" tread: retail $57.99, contractor $47.99.
    await expect(page.getByRole("main").getByText("$57.99").first()).toBeVisible();
    await expect(page.getByRole("main").getByText("$47.99")).toHaveCount(0);
  });
}

test("approved contractor sees contractor prices everywhere (positive control)", async ({ page }) => {
  await login(page, "priya.raman@example.com");
  expect((await payloadLeaks(page)).length).toBeGreaterThan(0);
  await page.goto("/products/harbour-oak-rigid-core-spc-plank");
  await expect(page.getByText("Contractor price").first()).toBeVisible();
  await expect(page.getByText("$64.99").first()).toBeVisible();
  await page.goto("/products/solid-core-sound-dampening-door-slab");
  await expect(page.getByText("$389").first()).toBeVisible();
  await page.goto("/products/solid-red-oak-stair-tread");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.keyboard.press("Escape");
  await page.goto("/cart");
  await expect(page.getByRole("main").getByText("$47.99").first()).toBeVisible();
});

test("pending and rejected contractors see their application status", async ({ page }) => {
  await login(page, "marcus.bell@example.com");
  await page.goto("/products/harbour-oak-rigid-core-spc-plank");
  await expect(page.getByText("Your contractor application is under review").first()).toBeVisible();
  await page.goto("/contractors/apply");
  await expect(page).toHaveURL(/\/contractors\/apply\/submitted/);
  await logout(page);

  await login(page, "elena.novak@example.com");
  await page.goto("/contractors/apply/submitted");
  await expect(page.getByText("Not approved").first()).toBeVisible();
});

test("product variations change the price and carry into the cart", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/products/contour-lever-passage-set");
  await expect(page.getByText("$29.99").first()).toBeVisible();
  await page.locator("label").filter({ hasText: "Brushed Brass" }).click();
  await expect(page.getByText("$34.99").first()).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  const drawer = page.getByRole("dialog", { name: /Your cart/ });
  await expect(drawer.getByText(/Brushed Brass/).first()).toBeVisible();
  await expect(drawer.getByText("$34.99").first()).toBeVisible();
  await page.keyboard.press("Escape");

  // Size variant: 36" (default, -$12) → 48" (base price).
  await page.goto("/products/solid-red-oak-stair-tread");
  await expect(page.getByText("$57.99").first()).toBeVisible();
  await page.locator("label").filter({ hasText: '48"' }).click();
  await expect(page.getByText("$69.99").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("square-footage calculator recommends a quantity", async ({ page }) => {
  await page.goto("/products/harbour-oak-rigid-core-spc-plank");
  const use = page.getByRole("button", { name: /^Use \d+ boxes$/ });
  await expect(use).toBeVisible();
  const boxes = Number((await use.textContent())!.match(/\d+/)![0]);
  expect(boxes).toBeGreaterThan(0);
  await use.click();
  await expect(page.getByRole("spinbutton", { name: "Quantity" })).toHaveValue(String(boxes));
});

test("cart delivery checker: local, out-of-area and invalid postal codes", async ({ page }) => {
  await page.goto("/products/contour-lever-privacy-set");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.keyboard.press("Escape");
  await page.goto("/cart");
  const postal = page.getByLabel("Check delivery to your area");
  const check = page.getByRole("button", { name: "Check", exact: true });
  await postal.fill("L5A 1B2");
  await check.click();
  await expect(page.getByText("Estimated delivery: 1–3 business days.").first()).toBeVisible();
  await postal.fill("V6B 1A1");
  await check.click();
  await expect(page.getByText(/outside our regular delivery area/).first()).toBeVisible();
  await postal.fill("123");
  await check.click();
  await expect(page.getByText(/Enter a valid postal code/).first()).toBeVisible();
});

test("product → request a quote carries the product and variant", async ({ page }) => {
  await page.goto("/products/shaker-1-panel-interior-door-slab");
  await page.locator("label").filter({ hasText: '32"' }).click();
  await page.getByRole("link", { name: "Request a quote for this item" }).click();
  await expect(page).toHaveURL(/\/quote\?/);
  await expect(page.getByText("Selected items", { exact: true })).toBeVisible();
  await expect(page.getByRole("main").getByText("Shaker 1-Panel Interior Door Slab").first()).toBeVisible();
  await page.getByLabel("Full name").fill("Val Variant");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("val@example.com");
  await page.getByRole("textbox", { name: /^Phone/ }).fill("555 010 2323");
  await page.getByLabel("Project address").fill("Your City, ON");
  await page.getByRole("button", { name: "Submit quote request" }).click();
  await expect(page).toHaveURL(/\/quote\/confirmation\//);
  await expect(page.getByText(/Q-\d{4}-\d{4}/).first()).toBeVisible();
});

test("upload validation rejects oversized and spoofed files", async ({ page }) => {
  await page.goto("/quote");
  const input = page.getByLabel("Upload project files");
  await input.setInputFiles({ name: "huge.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(11 * 1024 * 1024, 0x25) });
  await expect(page.getByText(/larger than|too large|exceeds/i).first()).toBeVisible();
  await input.setInputFiles({ name: "fake.pdf", mimeType: "application/pdf", buffer: Buffer.from("MZ not really a pdf") });
  await expect(page.getByText(/doesn't look like|content doesn|not a valid|match/i).first()).toBeVisible();
});

test("admin: inventory quick edit shows the correct restock date on the storefront", async ({ page }) => {
  await login(page, "admin@example.com");
  await page.goto("/admin/inventory");
  const name = "Contour Lever Privacy Set";
  await page.getByLabel(`Stock status for ${name}`).selectOption("out_of_stock");
  await page.getByLabel(`Restock date for ${name}`).fill("2027-03-15");
  const row = page.getByRole("row").filter({ hasText: name });
  await row.getByRole("button", { name: "Save" }).click();
  await expect(row.getByText("Saved")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel(`Restock date for ${name}`)).toHaveValue("2027-03-15");
  await logout(page);
  await page.goto("/products/contour-lever-privacy-set");
  await expect(page.getByText(/March 15, 2027/).first()).toBeVisible();
  await expect(page.getByText("Expected restock Mar 15").first()).toBeVisible();
});

test("admin: update an order status → customer sees it", async ({ page }) => {
  await login(page, "admin@example.com");
  await page.goto("/admin/orders?status=processing");
  const row = page.getByRole("row").filter({ hasText: "Jordan Avery" }).first();
  const number = (await row.getByRole("link").first().textContent())!.trim();
  await row.getByRole("link").first().click();
  await page.getByLabel("Order status").selectOption("ready_for_pickup");
  await page.getByLabel("Note").fill("Your order is at the pickup counter.");
  await page.getByRole("button", { name: "Update order" }).click();
  await expect(page.getByText("Order updated").first()).toBeVisible();
  await logout(page);
  await login(page, "jordan.avery@example.com");
  await page.goto(`/account/orders/${number}`);
  await expect(page.getByText("Ready for pickup").first()).toBeVisible();
});

test("admin: reject a contractor application → retail pricing and email", async ({ page }) => {
  await login(page, "admin@example.com");
  await page.goto("/admin/contractors");
  await page.getByRole("link", { name: /Diego Alvarez|Alvarez/ }).first().click();
  await page.getByLabel("Decision note").fill("Please reapply with a business number.");
  await page.getByRole("button", { name: "Reject application" }).click();
  await expect(page.getByText("Application rejected. Customer notified (simulated).").first()).toBeVisible();
  await page.goto("/admin/emails");
  await expect(page.getByText(/contractor application/i).first()).toBeVisible();
  await logout(page);
  await login(page, "diego@example.com");
  await page.goto("/products/harbour-oak-rigid-core-spc-plank");
  await expect(page.getByText("Contractor price")).toHaveCount(0);
  await expect(page.getByText("$69.99").first()).toBeVisible();
});

test("demo persona switcher signs in and out", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Demo: Guest/ }).click();
  await page.getByRole("button", { name: /Approved contractor/ }).click();
  await expect(page.getByRole("button", { name: /^Demo: Approved contractor/ })).toBeVisible();
  await page.goto("/products/harbour-oak-rigid-core-spc-plank");
  await expect(page.getByText("Contractor price").first()).toBeVisible();
  await page.getByRole("button", { name: /^Demo: Approved contractor/ }).click();
  await page.getByRole("button", { name: /Administrator/ }).click();
  await expect(page).toHaveURL(/\/admin/);
  await page.getByRole("button", { name: /^Demo: Administrator/ }).click();
  await page.getByRole("button", { name: /Guest|Sign out/ }).last().click();
  await expect(page.getByRole("button", { name: /^Demo: Guest/ })).toBeVisible();
});

const widths = [375, 390, 430, 768, 1024, 1280, 1440];
const signedInPages = ["/account", "/account/orders", "/account/quotes", "/account/files", "/account/profile", "/cart", "/checkout", "/quote?from=cart"];
const adminPages = ["/admin", "/admin/products", "/admin/pricing", "/admin/inventory", "/admin/orders", "/admin/quotes", "/admin/contractors", "/admin/media?tab=documents", "/admin/delivery"];

test("responsive: account, cart-with-items and admin pages at every width", async ({ page }) => {
  await login(page, "priya.raman@example.com");
  await page.goto("/products/contour-lever-passage-set");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.keyboard.press("Escape");
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of signedInPages) {
      await page.goto(path);
      await expectNoHorizontalOverflow(page);
    }
  }
  await logout(page);
  await login(page, "admin@example.com");
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of adminPages) {
      await page.goto(path);
      await expectNoHorizontalOverflow(page);
    }
  }
});

test("responsive: storefront pages at every width", async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/shop", "/search?q=vanity", "/deals", "/contractors", "/contact", "/account/login", "/account/register", "/policies/returns", "/products/shaker-1-panel-interior-door-slab", "/quote?product=shaker-1-panel-interior-door-slab&qty=2"]) {
      await page.goto(path);
      await expectNoHorizontalOverflow(page);
    }
  }
});
