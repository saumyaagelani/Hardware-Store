import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { StaffPermission, User } from "@/lib/types";
import type { PricingViewer } from "@/lib/pricing";
import { getDb } from "@/server/db";
import { env } from "@/config/env";

/**
 * Signed-cookie sessions. The cookie only carries the user id and expiry; the
 * user record (and therefore role and contractor status) is re-read on every
 * request so that approvals take effect immediately and cannot be forged on
 * the client.
 */

const COOKIE_NAME = "nl_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

const globalSecret = globalThis as unknown as { __nlSessionSecret?: string };

function secret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  // Development / demo fallback: a random per-process secret. Sessions reset on restart.
  globalSecret.__nlSessionSecret ??= randomBytes(32).toString("hex");
  return globalSecret.__nlSessionSecret;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function encodeSession(userId: string, expiresAt: number): string {
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const expected = Buffer.from(sign(`${userId}.${exp}`));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  if (Number(exp) < Date.now()) return null;
  return userId;
}

export async function startSession(userId: string): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(userId, expiresAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && env.siteUrl.startsWith("https"),
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export type SafeUser = Omit<User, "passwordHash">;

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _omit, ...safe } = user;
  void _omit;
  return safe;
}

/** The signed-in user for this request (memoised per request). */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const store = await cookies();
  const userId = decodeSession(store.get(COOKIE_NAME)?.value);
  if (!userId) return null;
  const user = getDb().users.find((u) => u.id === userId);
  return user ? toSafeUser(user) : null;
});

export function pricingViewerFor(user: SafeUser | null): PricingViewer | null {
  if (!user) return null;
  return { accountType: user.accountType, contractorStatus: user.contractorStatus, role: user.role };
}

export async function getPricingViewer(): Promise<PricingViewer | null> {
  return pricingViewerFor(await getCurrentUser());
}

export async function requireUser(returnTo = "/account"): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

export function isStaff(user: SafeUser | null): boolean {
  return Boolean(user && (user.role === "admin" || user.role === "staff"));
}

export function hasPermission(user: SafeUser | null, permission?: StaffPermission): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "staff") return false;
  return permission ? Boolean(user.staffPermissions?.includes(permission)) : true;
}

/** Server-side guard for admin pages and actions. */
export async function requireStaff(permission?: StaffPermission): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=/admin`);
  if (!isStaff(user)) redirect("/account/login?next=/admin&denied=1");
  if (!hasPermission(user, permission)) redirect("/admin?denied=permission");
  return user;
}
