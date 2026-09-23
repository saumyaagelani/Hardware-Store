"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { saveCategoryAction } from "@/app/actions/admin";
import { TextField, TextareaField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";

export function CategoryEditor({ category, productCount }: { category: Category; productCount: number }) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [subs, setSubs] = useState(category.subcategories);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="rounded-lg border border-line bg-white p-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveCategoryAction(category.id, { name, description, subcategories: subs.filter((s) => s.name.trim()) });
          if (res.ok) {
            setSaved(true);
            setError(null);
            router.refresh();
          } else setError(Object.values(res.fieldErrors ?? {})[0] ?? res.error ?? "Save failed");
        });
      }}
    >
      <div className="flex items-start gap-4">
        <img src={`/media/categories/${category.slug}.svg`} alt="" className="hidden h-20 w-28 shrink-0 rounded-md object-cover ring-1 ring-line sm:block" />
        <div className="grid flex-1 gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-body">
              /shop/{category.slug} · {productCount} products
            </p>
          </div>
          <TextField label="Category name" value={name} onChange={(e) => { setSaved(false); setName(e.target.value); }} />
          <TextareaField label="Description" rows={2} value={description} onChange={(e) => { setSaved(false); setDescription(e.target.value); }} />
          <div>
            <p className="field-label">Subcategories</p>
            <ul className="flex flex-wrap gap-2">
              {subs.map((s, i) => (
                <li key={i} className="flex items-center gap-1 rounded-md border border-line bg-canvas pr-1">
                  <input
                    aria-label={`Subcategory ${i + 1}`}
                    value={s.name}
                    onChange={(e) => { setSaved(false); setSubs(subs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))); }}
                    className="w-40 bg-transparent px-2 py-1.5 text-sm text-ink focus:outline-none"
                  />
                  <button type="button" onClick={() => { setSaved(false); setSubs(subs.filter((_, j) => j !== i)); }} className="p-1 text-body hover:text-danger" aria-label={`Remove ${s.name}`}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => setSubs([...subs, { slug: "", name: "" }])} className="inline-flex h-full items-center gap-1 rounded-md border border-dashed border-line px-3 py-1.5 text-sm font-semibold text-ink hover:border-ink">
                  <Plus className="h-3.5 w-3.5" aria-hidden /> Add
                </button>
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-end gap-3">
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            {saved ? (
              <p className="flex items-center gap-1 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Saved
              </p>
            ) : null}
            <Button type="submit" size="sm" variant="dark" loading={pending}>
              Save category
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
