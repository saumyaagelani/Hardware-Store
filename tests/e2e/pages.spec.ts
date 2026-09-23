import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, login, watchConsole } from "./helpers";

const publicPages = ["/", "/shop", "/shop/doors", "/search?q=vanity", "/search?q=zzzz", "/deals", "/products/60in-frameless-sliding-shower-door", "/cart", "/checkout", "/quote", "/contractors", "/contractors/apply", "/contact", "/account/login", "/account/register", "/policies/delivery", "/does-not-exist"];

test("key routes render without console errors", async ({ page }) => {
  const errors = watchConsole(page);
  for (const path of publicPages) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(path === "/does-not-exist" ? 404 : 200);
    await expect(page.locator("h1").first()).toBeVisible();
  }
  expect(errors.filter((e) => !e.includes("404"))).toEqual([]);
});

test("search and empty states", async ({ page }) => {
  await page.goto("/search?q=zzzz");
  await expect(page.getByText("No results for “zzzz”").first()).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
});

test("filters update the product list", async ({ page }) => {
  await page.goto("/shop/vinyl");
  const count = async () => Number((await page.getByText(/^\d+ products?$/).filter({ visible: true }).first().textContent())?.split(" ")[0]);
  const before = await count();
  await page.getByRole("complementary", { name: "Filters" }).getByLabel("Special order").check();
  await expect(page).toHaveURL(/availability=special_order/);
  await expect.poll(count).toBeLessThan(before);
  await page.getByRole("button", { name: "Clear all" }).click();
  await expect.poll(count).toBe(before);
});

for (const width of [375, 390, 430, 768, 1024, 1280, 1440]) {
  test(`responsive layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/shop/vinyl", "/products/harbour-oak-rigid-core-spc-plank", "/quote", "/checkout", "/contractors/apply"]) {
      await page.goto(path);
      await expectNoHorizontalOverflow(page);
    }
  });
}

test("mobile navigation drawer works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const drawer = page.getByRole("dialog", { name: "Menu" });
  await drawer.getByRole("button", { name: "Bathroom" }).click();
  await drawer.getByRole("link", { name: /Vanities/ }).click();
  await expect(page).toHaveURL(/\/shop\/vanities/);
});

test("admin pages render at desktop and mobile widths", async ({ page }) => {
  const errors = watchConsole(page);
  await login(page, "admin@example.com");
  const pages = ["/admin", "/admin/products", "/admin/products/new", "/admin/categories", "/admin/variations", "/admin/media", "/admin/pricing", "/admin/inventory", "/admin/orders", "/admin/quotes", "/admin/customers", "/admin/contractors", "/admin/messages", "/admin/delivery", "/admin/pickup", "/admin/promotions", "/admin/content", "/admin/emails", "/admin/staff", "/admin/integrations"];
  for (const path of pages) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/admin", "/admin/products", "/admin/quotes"]) {
    await page.goto(path);
    await expectNoHorizontalOverflow(page);
  }
  expect(errors).toEqual([]);
});
