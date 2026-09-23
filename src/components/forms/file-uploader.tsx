"use client";

import { useRef, useState, type DragEvent } from "react";
import { FileText, ImageIcon, Loader2, UploadCloud, X, AlertCircle } from "lucide-react";
import { UPLOAD_RULES, validateUploadClient } from "@/lib/uploads";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface UploadedItem {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

interface PendingItem {
  key: string;
  name: string;
  size: number;
  status: "uploading" | "error";
  error?: string;
}

export function FileUploader({ value, onChange }: { value: UploadedItem[]; onChange: (files: UploadedItem[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const latest = useRef(value);
  latest.current = value;

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    const room = UPLOAD_RULES.maxFiles - latest.current.length - pending.filter((p) => p.status === "uploading").length;
    for (const [i, file] of list.entries()) {
      const key = `${file.name}-${file.size}-${Date.now()}-${i}`;
      const clientError = i >= room ? `Maximum of ${UPLOAD_RULES.maxFiles} files.` : validateUploadClient(file);
      if (clientError) {
        setPending((p) => [...p, { key, name: file.name, size: file.size, status: "error", error: clientError }]);
        continue;
      }
      setPending((p) => [...p, { key, name: file.name, size: file.size, status: "uploading" }]);
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        onChange([...latest.current, data as UploadedItem]);
        setPending((p) => p.filter((x) => x.key !== key));
      } catch (e) {
        setPending((p) => p.map((x) => (x.key === key ? { ...x, status: "error", error: e instanceof Error ? e.message : "Upload failed" } : x)));
      }
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) void upload(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn("flex flex-col items-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors", dragging ? "border-gold-dark bg-gold-soft" : "border-line bg-canvas")}
      >
        <UploadCloud className="h-9 w-9 text-body" aria-hidden />
        <p className="mt-2 text-sm font-semibold text-ink">
          Drag files here or{" "}
          <button type="button" onClick={() => inputRef.current?.click()} className="text-ink underline decoration-gold decoration-2 underline-offset-2">
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-body">Photos, measurements, floor plans or PDFs · {UPLOAD_RULES.description}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={UPLOAD_RULES.accept}
          className="sr-only"
          aria-label="Upload project files"
          onChange={(e) => {
            if (e.target.files?.length) void upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {value.length || pending.length ? (
        <ul className="mt-3 space-y-2" aria-live="polite">
          {value.map((f) => (
            <li key={f.id} className="flex items-center gap-3 rounded-md border border-line bg-white px-3 py-2.5 text-sm">
              {f.mimeType === "application/pdf" ? <FileText className="h-5 w-5 shrink-0 text-danger" aria-hidden /> : <ImageIcon className="h-5 w-5 shrink-0 text-info" aria-hidden />}
              <span className="min-w-0 flex-1 truncate font-medium text-ink">{f.originalName}</span>
              <span className="text-xs text-body">{formatBytes(f.sizeBytes)}</span>
              <button type="button" onClick={() => onChange(value.filter((x) => x.id !== f.id))} className="rounded p-1 text-body hover:text-danger" aria-label={`Remove ${f.originalName}`}>
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
          {pending.map((p) => (
            <li key={p.key} className={cn("flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm", p.status === "error" ? "border-danger/30 bg-danger-soft" : "border-line bg-white")}>
              {p.status === "uploading" ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-body" aria-hidden /> : <AlertCircle className="h-5 w-5 shrink-0 text-danger" aria-hidden />}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">{p.name}</span>
                {p.error ? <span className="block text-xs text-danger">{p.error}</span> : <span className="block text-xs text-body">Uploading…</span>}
              </span>
              {p.status === "error" ? (
                <button type="button" onClick={() => setPending((all) => all.filter((x) => x.key !== p.key))} className="rounded p-1 text-body hover:text-ink" aria-label={`Dismiss ${p.name}`}>
                  <X className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
