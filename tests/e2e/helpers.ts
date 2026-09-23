import { expect, type Page } from "@playwright/test";

export const DEMO_PASSWORD = "Demo1234";

export async function login(page: Page, email: string, password = DEMO_PASSWORD) {
  await page.goto("/account/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.locator("form input[type=password]").first().fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/account/login"));
}

export async function logout(page: Page) {
  await page.context().clearCookies();
}

/** Collect console errors and uncaught exceptions for a page. */
export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}
