"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, UserMinus } from "lucide-react";
import type { StaffPermission } from "@/lib/types";
import { removeStaffAction, saveStaffAction } from "@/app/actions/admin";
import { Dialog } from "@/components/ui/dialog";
import { Checkbox, SelectField, TextField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

export interface StaffRow {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "staff";
  permissions: StaffPermission[];
  lastLoginAt?: string;
}

const permissionLabels: Record<StaffPermission, string> = {
  catalog: "Products, pricing & inventory",
  orders: "Orders",
  quotes: "Quote requests",
  customers: "Customers & contractor approvals",
  content: "Banners & website content",
  settings: "Delivery, pickup & notifications",
};

export function StaffManager({ staff, meId, canManage }: { staff: StaffRow[]; meId: string; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<(Omit<StaffRow, "id"> & { id?: string; password: string }) | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <>
      <div className="mb-4 flex justify-end">
        {canManage ? (
          <Button size="sm" onClick={() => setEditing({ fullName: "", email: "", role: "staff", permissions: ["orders", "quotes"], password: "" })}>
            <Plus className="h-4 w-4" aria-hidden /> Add staff member
          </Button>
        ) : null}
      </div>
      <ul className="grid gap-3 lg:grid-cols-2">
        {staff.map((s) => (
          <li key={s.id} className="rounded-lg border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">
                  {s.fullName} {s.id === meId ? <span className="text-xs font-normal text-body">(you)</span> : null}
                </p>
                <p className="text-sm text-body">{s.email}</p>
              </div>
              <StatusBadge tone={s.role === "admin" ? "gold" : "info"}>{s.role === "admin" ? "Administrator" : "Staff"}</StatusBadge>
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {s.permissions.map((p) => (
                <li key={p} className="rounded-full bg-mist px-2.5 py-0.5 text-xs text-ink">
                  {permissionLabels[p]}
                </li>
              ))}
            </ul>
            {canManage ? (
              <div className="mt-4 flex gap-2 border-t border-line pt-3">
                <Button size="sm" variant="ghost" onClick={() => setEditing({ ...s, password: "" })}>
                  <Pencil className="h-4 w-4" aria-hidden /> Edit
                </Button>
                {s.id !== meId ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      window.confirm(`Remove staff access for ${s.fullName}?`) &&
                      start(async () => {
                        const r = await removeStaffAction(s.id);
                        if (!r.ok) setError(r.error ?? "Failed");
                        router.refresh();
                      })
                    }
                  >
                    <UserMinus className="h-4 w-4" aria-hidden /> Remove access
                  </Button>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? "Edit staff member" : "Add staff member"}>
        {editing ? (
          <form
            noValidate
            className="space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await saveStaffAction({ ...editing, password: editing.password || undefined });
                if (r.ok) {
                  setEditing(null);
                  setErrors({});
                  router.refresh();
                } else {
                  setErrors(r.fieldErrors ?? {});
                  setError(r.error ?? null);
                }
              });
            }}
          >
            <TextField label="Full name" value={editing.fullName} onChange={(e) => setEditing({ ...editing, fullName: e.target.value })} error={errors.fullName} />
            <TextField label="Email" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} error={errors.email} />
            <SelectField
              label="Role"
              value={editing.role}
              onChange={(e) => setEditing({ ...editing, role: e.target.value as "admin" | "staff" })}
              options={[
                { value: "staff", label: "Staff — limited permissions" },
                { value: "admin", label: "Administrator — full access" },
              ]}
            />
            {editing.role === "staff" ? (
              <fieldset>
                <legend className="field-label">Permissions</legend>
                <div className="space-y-2">
                  {(Object.keys(permissionLabels) as StaffPermission[]).map((p) => (
                    <Checkbox
                      key={p}
                      label={permissionLabels[p]}
                      checked={editing.permissions.includes(p)}
                      onChange={(e) => setEditing({ ...editing, permissions: e.target.checked ? [...editing.permissions, p] : editing.permissions.filter((x) => x !== p) })}
                    />
                  ))}
                </div>
              </fieldset>
            ) : null}
            <TextField label={editing.id ? "Reset password" : "Temporary password"} optional={Boolean(editing.id)} type="password" autoComplete="new-password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} error={errors.password} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="dark" loading={pending}>
                Save
              </Button>
            </div>
          </form>
        ) : null}
      </Dialog>
    </>
  );
}
