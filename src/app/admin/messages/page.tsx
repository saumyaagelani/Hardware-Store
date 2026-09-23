import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDateTime } from "@/lib/format";
import { AdminHeader } from "@/components/admin/ui";
import { MessageStatus } from "@/components/admin/message-status";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Contact submissions" };

export default async function MessagesPage() {
  await requireStaff("customers");
  const messages = getDb().contactSubmissions;
  return (
    <>
      <AdminHeader title="Contact submissions" description="Messages sent through the website contact form." />
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className="rounded-lg border border-line bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{m.name}</p>
                  <StatusBadge tone="neutral" dot={false}>{m.topic}</StatusBadge>
                  {m.status === "new" ? <StatusBadge tone="gold">New</StatusBadge> : null}
                </div>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-body">
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-ink"><Mail className="h-3.5 w-3.5" aria-hidden /> {m.email}</a>
                  {m.phone ? <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 hover:text-ink"><Phone className="h-3.5 w-3.5" aria-hidden /> {m.phone}</a> : null}
                  <span>{formatDateTime(m.createdAt)}</span>
                </p>
              </div>
              <MessageStatus id={m.id} status={m.status} />
            </div>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink">{m.message}</p>
          </li>
        ))}
      </ul>
      {!messages.length ? <p className="text-sm text-body">No messages yet.</p> : null}
    </>
  );
}
