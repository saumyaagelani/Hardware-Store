"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/lib/types";
import { contractorApplicationSchema, contractorBusinessSchema, fieldErrors } from "@/lib/validation";
import { getDb, mutate, newId } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import { getCurrentUser, startSession } from "@/server/auth/session";
import { notifyContractorApplication } from "@/server/services/notifications";

/**
 * Contractor applications always start as "pending". A signed-in regular
 * customer can upgrade their existing account; otherwise a new account is
 * created. Contractor pricing is only unlocked by an administrator.
 */
export async function applyContractorAction(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  const current = await getCurrentUser();
  // A signed-in customer upgrades their account, so no new password is needed.
  const parsed = (current ? contractorBusinessSchema : contractorApplicationSchema).safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const now = new Date().toISOString();

  const application: User["contractorApplication"] = {
    submittedAt: now,
    businessType: d.businessType,
    yearsInBusiness: d.yearsInBusiness || undefined,
    tradeLicence: d.tradeLicence || undefined,
    website: d.website || undefined,
    estimatedMonthlySpend: d.estimatedMonthlySpend || undefined,
    notes: d.notes || undefined,
  };
  const businessAddress = { ...d.businessAddress, company: d.companyName };

  if (current) {
    if (current.role !== "customer") return { ok: false, error: "Staff accounts can't apply for contractor pricing." };
    if (current.accountType === "contractor" && current.contractorStatus !== "rejected") {
      return { ok: false, error: "This account already has a contractor application on file." };
    }
    const updated = mutate((db) => {
      const u = db.users.find((x) => x.id === current.id);
      if (!u) return null;
      Object.assign(u, {
        accountType: "contractor",
        contractorStatus: "pending",
        companyName: d.companyName,
        hstNumber: d.hstNumber || u.hstNumber,
        phone: d.phone,
        preferredContact: d.preferredContact,
        businessAddress,
        billingAddress: u.billingAddress ?? businessAddress,
        contractorApplication: application,
      } satisfies Partial<User>);
      return u;
    });
    if (!updated) return { ok: false, error: "Account not found." };
    await notifyContractorApplication(updated);
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: "/contractors/apply/submitted" };
  }

  if (getDb().users.some((u) => u.email === d.email)) {
    return { ok: false, fieldErrors: { email: "An account with this email already exists. Sign in first to upgrade it to a contractor account." } };
  }
  const user: User = {
    id: newId("usr"),
    email: d.email,
    passwordHash: hashPassword("password" in d && typeof d.password === "string" ? d.password : crypto.randomUUID()),
    fullName: d.contactName,
    phone: d.phone,
    role: "customer",
    accountType: "contractor",
    contractorStatus: "pending",
    companyName: d.companyName,
    hstNumber: d.hstNumber || undefined,
    preferredContact: d.preferredContact,
    businessAddress,
    billingAddress: businessAddress,
    deliveryAddresses: [{ ...businessAddress, label: "Business" }],
    contractorApplication: application,
    createdAt: now,
    lastLoginAt: now,
  };
  mutate((db) => {
    db.users.push(user);
  });
  await notifyContractorApplication(user);
  await startSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true, redirectTo: "/contractors/apply/submitted" };
}
