import { notFound, redirect } from "next/navigation";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";

/** Resolve a quote reference (Q-YYYY-NNNN) to the admin quote page. */
export default async function QuoteByReference({ params }: PageProps<"/admin/quotes/by-reference/[reference]">) {
  await requireStaff("quotes");
  const { reference } = await params;
  const quote = getDb().quotes.find((q) => q.reference === reference);
  if (!quote) notFound();
  redirect(`/admin/quotes/${quote.id}`);
}
