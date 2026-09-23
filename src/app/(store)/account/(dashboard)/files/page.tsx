import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, FolderOpen, ImageIcon } from "lucide-react";
import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { formatBytes, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/account/dashboard-ui";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Project files", robots: { index: false } };

export default async function FilesPage() {
  const user = await requireUser("/account/files");
  const db = getDb();
  const files = db.uploads.filter((u) => u.userId === user.id).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const quoteById = new Map(db.quotes.map((q) => [q.id, q]));
  return (
    <>
      <PageHeader title="Project files" description="Photos, plans and documents you've shared with us on quote requests." />
      {files.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {files.map((f) => {
            const quote = f.quoteId ? quoteById.get(f.quoteId) : undefined;
            return (
              <li key={f.id} className="flex items-center gap-4 rounded-lg border border-line bg-white p-4">
                <span className={f.mimeType === "application/pdf" ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-danger-soft text-danger" : "flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-info-soft text-info"}>
                  {f.mimeType === "application/pdf" ? <FileText className="h-5 w-5" aria-hidden /> : <ImageIcon className="h-5 w-5" aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{f.originalName}</p>
                  <p className="text-xs text-body">
                    {formatBytes(f.sizeBytes)} · {formatDate(f.uploadedAt)}
                    {quote ? (
                      <>
                        {" · "}
                        <Link href={`/account/quotes/${quote.reference}`} className="font-semibold text-ink hover:underline">
                          {quote.reference}
                        </Link>
                      </>
                    ) : " · Not yet attached"}
                  </p>
                </div>
                <a href={`/api/uploads/${f.id}`} className="rounded-md p-2 text-body hover:bg-mist hover:text-ink" aria-label={`Download ${f.originalName}`}>
                  <Download className="h-4.5 w-4.5" aria-hidden />
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={FolderOpen} title="No project files yet" description="Files you attach to quote requests — photos, measurements or floor plans — will be listed here.">
          <ButtonLink href="/quote" variant="dark">
            Start a quote with files
          </ButtonLink>
        </EmptyState>
      )}
      <p className="mt-6 text-xs text-body">Accepted: JPG, PNG, WEBP, HEIC and PDF up to 10 MB each. Files are stored privately and only visible to you and our team.</p>
    </>
  );
}
