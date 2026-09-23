"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import type { Quote } from "@/lib/types";
import { fieldErrors, quoteSchema } from "@/lib/validation";
import { nextQuoteReference } from "@/lib/quote-ref";
import { getDb, mutate, newId } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";
import { notifyQuoteSubmitted } from "@/server/services/notifications";

export async function submitQuoteAction(input: unknown): Promise<ActionResult<{ quoteId: string; reference: string }>> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  if (!d.productsRequested && d.items.length === 0) {
    return { ok: false, fieldErrors: { productsRequested: "Tell us which products you need" } };
  }
  const user = await getCurrentUser();
  const productsById = new Map(getDb().products.map((p) => [p.id, p]));

  const quote = mutate((db) => {
    const { reference, counters } = nextQuoteReference(db.counters);
    db.counters = counters;
    const now = new Date().toISOString();
    const id = newId("qte");

    // Only attach uploads that are unclaimed and belong to this visitor.
    const fileIds = d.fileIds.filter((fid) => {
      const upload = db.uploads.find((u) => u.id === fid);
      return upload && !upload.quoteId && (!upload.userId || upload.userId === user?.id);
    });
    for (const fid of fileIds) {
      const upload = db.uploads.find((u) => u.id === fid)!;
      upload.quoteId = id;
      upload.userId ??= user?.id;
    }

    const created: Quote = {
      id,
      reference,
      createdAt: now,
      updatedAt: now,
      status: "submitted",
      source: d.source,
      userId: user?.id,
      customerType: d.customerType,
      contact: {
        fullName: d.fullName,
        email: d.email,
        phone: d.phone,
        companyName: d.companyName || undefined,
        preferredContact: d.preferredContact,
      },
      projectAddress: d.projectAddress,
      items: d.items.map((item) => {
        const product = item.productId ? productsById.get(item.productId) : undefined;
        return {
          productId: product?.id,
          name: product?.name ?? item.name,
          sku: product?.sku ?? item.sku,
          quantity: item.quantity,
          optionsLabel: item.optionsLabel,
        };
      }),
      productsRequested: d.productsRequested || d.items.map((i) => i.name).join(", "),
      preferredStyles: d.preferredStyles || undefined,
      measurements: [d.measurements, d.quantities && `Quantities: ${d.quantities}`].filter(Boolean).join("\n") || undefined,
      installationRequired: d.installationRequired === "yes",
      fulfilment: d.fulfilment,
      preferredDate: d.preferredDate || undefined,
      details: d.details || undefined,
      fileIds,
      history: [{ status: "submitted", at: now, by: "Website" }],
    };
    db.quotes.unshift(created);
    return created;
  });

  await notifyQuoteSubmitted(quote);
  revalidatePath("/", "layout");
  return { ok: true, quoteId: quote.id, reference: quote.reference };
}
