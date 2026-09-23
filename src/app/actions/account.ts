"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import { addressSchema, contactMethodField, fieldErrors, passwordField, phoneField, requiredText } from "@/lib/validation";
import { getDb, mutate } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";
import { hashPassword, verifyPassword } from "@/server/auth/password";

const profileSchema = z.object({
  fullName: requiredText("Full name", 120),
  phone: phoneField,
  companyName: z.string().trim().max(160).optional().default(""),
  hstNumber: z.string().trim().max(40).optional().default(""),
  preferredContact: contactMethodField,
  marketingOptIn: z.boolean().optional().default(false),
});

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  mutate((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (!u) return;
    u.fullName = parsed.data.fullName;
    u.phone = parsed.data.phone;
    u.companyName = parsed.data.companyName || undefined;
    u.hstNumber = parsed.data.hstNumber || undefined;
    u.preferredContact = parsed.data.preferredContact;
    u.marketingOptIn = parsed.data.marketingOptIn;
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

const saveAddressSchema = z.object({
  kind: z.enum(["billing", "delivery"]),
  index: z.number().int().min(-1).max(20),
  label: z.string().trim().max(40).optional().default(""),
  address: addressSchema,
});

/** index -1 adds a new delivery address. */
export async function saveAddressAction(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const parsed = saveAddressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const { kind, index, label, address } = parsed.data;
  mutate((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (!u) return;
    const value = { ...address, label: label || undefined, name: u.fullName };
    if (kind === "billing") u.billingAddress = value;
    else if (index === -1) u.deliveryAddresses.push(value);
    else if (u.deliveryAddresses[index]) u.deliveryAddresses[index] = value;
  });
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function deleteAddressAction(index: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  mutate((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (u && Number.isInteger(index)) u.deliveryAddresses.splice(index, 1);
  });
  revalidatePath("/account/addresses");
  return { ok: true };
}

const passwordSchema = z
  .object({ current: z.string().min(1, "Enter your current password"), password: passwordField, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const stored = getDb().users.find((u) => u.id === user.id);
  if (!stored || !verifyPassword(parsed.data.current, stored.passwordHash)) {
    return { ok: false, fieldErrors: { current: "Current password is incorrect" } };
  }
  mutate((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (u) u.passwordHash = hashPassword(parsed.data.password);
  });
  return { ok: true };
}
