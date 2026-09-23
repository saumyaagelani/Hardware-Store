"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import type { Address, User } from "@/lib/types";
import { fieldErrors, loginSchema, registerSchema } from "@/lib/validation";
import { getDb, mutate, newId, resetDatabase } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { endSession, startSession } from "@/server/auth/session";
import { notifyAccountRegistered } from "@/server/services/notifications";
import { DEMO_ACCOUNTS } from "@/data/seed/people";
import { env } from "@/config/env";

function safeNext(next: unknown, fallback: string): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function destinationFor(user: User): string {
  return user.role === "admin" || user.role === "staff" ? "/admin" : "/account";
}

export async function loginAction(input: { email: string; password: string; next?: string }): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const user = getDb().users.find((u) => u.email === parsed.data.email);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { ok: false, error: "The email or password you entered is incorrect." };
  }
  mutate((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (u) u.lastLoginAt = new Date().toISOString();
  });
  await startSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true, redirectTo: safeNext(input.next, destinationFor(user)) };
}

export async function logoutAction(): Promise<void> {
  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function registerAction(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  if (getDb().users.some((u) => u.email === d.email)) {
    return { ok: false, fieldErrors: { email: "An account with this email already exists. Try signing in." } };
  }
  const billing: Address = { ...d.billing, name: d.fullName, company: d.companyName || undefined };
  const delivery: Address = d.sameDelivery || !d.delivery ? { ...billing, label: "Primary" } : { ...d.delivery, label: "Primary", name: d.fullName };
  const user: User = {
    id: newId("usr"),
    email: d.email,
    passwordHash: hashPassword(d.password),
    fullName: d.fullName,
    phone: d.phone,
    role: "customer",
    accountType: "regular",
    companyName: d.companyName || undefined,
    hstNumber: d.hstNumber || undefined,
    preferredContact: d.preferredContact,
    billingAddress: billing,
    deliveryAddresses: [delivery],
    marketingOptIn: d.marketingOptIn,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
  mutate((db) => {
    db.users.push(user);
  });
  await notifyAccountRegistered(user);
  await startSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true, redirectTo: "/account?welcome=1" };
}

/* ---------------------------- Demo presenter tools ---------------------------- */

export async function demoSignInAction(key: string): Promise<ActionResult<{ redirectTo: string }>> {
  if (!env.demoMode) return { ok: false, error: "Demo mode is disabled." };
  const account = DEMO_ACCOUNTS.find((a) => a.key === key);
  const user = account && getDb().users.find((u) => u.id === account.userId);
  if (!user) return { ok: false, error: "Demo account not found. Try resetting the demo data." };
  await startSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true, redirectTo: destinationFor(user) };
}

export async function demoSignOutAction(): Promise<void> {
  await endSession();
  revalidatePath("/", "layout");
}

export async function resetDemoAction(): Promise<ActionResult> {
  if (!env.demoMode) return { ok: false, error: "Demo mode is disabled." };
  resetDatabase();
  revalidatePath("/", "layout");
  return { ok: true };
}
