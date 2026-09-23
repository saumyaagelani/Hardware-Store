"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import { contactSchema, emailField, fieldErrors } from "@/lib/validation";
import { mutate, newId, getDb } from "@/server/db";
import { adminEmail, sendNotification } from "@/server/services/email";

export async function submitContactAction(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const id = newId("msg");
  mutate((db) => {
    db.contactSubmissions.unshift({ id, createdAt: new Date().toISOString(), status: "new", ...d, phone: d.phone || undefined });
  });
  await sendNotification(
    "contact_admin",
    { to: adminEmail(), subject: `New enquiry: ${d.topic} — ${d.name}`, body: `${d.name} (${d.email}${d.phone ? `, ${d.phone}` : ""}) wrote:\n\n${d.message}` },
    id,
  );
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function subscribeNewsletterAction(email: string): Promise<ActionResult> {
  const parsed = emailField.safeParse(email);
  if (!parsed.success) return { ok: false, error: "Enter a valid email address" };
  if (!getDb().newsletter.some((n) => n.email === parsed.data)) {
    mutate((db) => {
      db.newsletter.push({ email: parsed.data, createdAt: new Date().toISOString() });
    });
    await sendNotification("newsletter_signup", {
      to: parsed.data,
      subject: "You're on the list",
      body: "Thanks for subscribing — we'll send occasional deals and new-product news. (Email marketing integration is a Stage 2 item.)",
    });
  }
  return { ok: true };
}
