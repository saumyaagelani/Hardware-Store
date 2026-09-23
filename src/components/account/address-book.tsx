"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import type { Address } from "@/lib/types";
import { deleteAddressAction, saveAddressAction } from "@/app/actions/account";
import { AddressFields, emptyAddress, type AddressValue } from "@/components/forms/address-fields";
import { Dialog } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";

type Editing = { kind: "billing" | "delivery"; index: number; label: string; address: AddressValue } | null;

const toValue = (a?: Address): AddressValue =>
  a ? { line1: a.line1, line2: a.line2 ?? "", city: a.city, province: a.province, postalCode: a.postalCode, country: a.country } : emptyAddress;

function AddressCard({ title, address, onEdit, onDelete }: { title: string; address?: Address; onEdit: () => void; onDelete?: () => void }) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <MapPin className="h-4.5 w-4.5 text-gold-dark" aria-hidden /> {title}
        </p>
        <div className="flex gap-1">
          <button type="button" onClick={onEdit} className="rounded p-1.5 text-body hover:bg-mist hover:text-ink" aria-label={`Edit ${title}`}>
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          {onDelete ? (
            <button type="button" onClick={onDelete} className="rounded p-1.5 text-body hover:bg-mist hover:text-danger" aria-label={`Delete ${title}`}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
      {address ? (
        <p className="mt-3 text-sm leading-relaxed text-body">
          {address.name ? <span className="block text-ink">{address.name}</span> : null}
          {address.company ? <span className="block">{address.company}</span> : null}
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}
          <br />
          {address.city}, {address.province} {address.postalCode}
        </p>
      ) : (
        <p className="mt-3 text-sm text-body">No address saved.</p>
      )}
    </div>
  );
}

export function AddressBook({ billing, delivery }: { billing?: Address; delivery: Address[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  const errs = Object.fromEntries(Object.entries(errors).map(([k, v]) => [k.replace(/^address\./, "edit."), v]));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Billing address</h2>
        <div className="max-w-md">
          <AddressCard title="Billing" address={billing} onEdit={() => setEditing({ kind: "billing", index: 0, label: "", address: toValue(billing) })} />
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Delivery addresses</h2>
          <Button size="sm" variant="outline" onClick={() => setEditing({ kind: "delivery", index: -1, label: "", address: emptyAddress })}>
            <Plus className="h-4 w-4" aria-hidden /> Add address
          </Button>
        </div>
        {delivery.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {delivery.map((a, i) => (
              <AddressCard
                key={`${a.line1}-${i}`}
                title={a.label ?? `Address ${i + 1}`}
                address={a}
                onEdit={() => setEditing({ kind: "delivery", index: i, label: a.label ?? "", address: toValue(a) })}
                onDelete={() =>
                  window.confirm("Delete this address?") &&
                  start(async () => {
                    await deleteAddressAction(i);
                    router.refresh();
                  })
                }
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-body">No delivery addresses yet — add one for faster checkout.</p>
        )}
      </section>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.index === -1 ? "Add delivery address" : editing?.kind === "billing" ? "Edit billing address" : "Edit delivery address"}>
        {editing ? (
          <form
            noValidate
            className="space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await saveAddressAction(editing);
                if (res.ok) {
                  setEditing(null);
                  setErrors({});
                  router.refresh();
                } else setErrors(res.fieldErrors ?? {});
              });
            }}
          >
            {editing.kind === "delivery" ? <TextField label="Label" optional placeholder="e.g. Home, Cottage, Job site" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} /> : null}
            <AddressFields prefix="edit" value={editing.address} onChange={(address) => setEditing({ ...editing, address })} errors={errs} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="dark" loading={pending}>
                Save address
              </Button>
            </div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
