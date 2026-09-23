"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { updateProfileAction } from "@/app/actions/account";
import { Checkbox, ChoiceCards, TextField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import type { ContactMethod } from "@/lib/types";

export function ProfileForm({
  initial,
  email,
  isContractor,
}: {
  initial: { fullName: string; phone: string; companyName: string; hstNumber: string; preferredContact: ContactMethod; marketingOptIn: boolean };
  email: string;
  isContractor: boolean;
}) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: "fullName" | "phone" | "companyName" | "hstNumber") => (e: { target: { value: string } }) => {
    setSaved(false);
    setF((x) => ({ ...x, [k]: e.target.value }));
  };

  return (
    <form
      noValidate
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateProfileAction(f);
          if (res.ok) {
            setErrors({});
            setSaved(true);
            router.refresh();
          } else setErrors(res.fieldErrors ?? {});
        });
      }}
    >
      <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
        <h2 className="mb-5 font-display text-lg font-bold text-ink">Personal information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Full name" required value={f.fullName} onChange={set("fullName")} error={errors.fullName} autoComplete="name" />
          <TextField label="Phone" type="tel" required value={f.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel" />
          <TextField containerClassName="sm:col-span-2" label="Email" value={email} disabled hint="Contact us to change the email on your account." />
        </div>
      </section>
      <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
        <h2 className="mb-5 font-display text-lg font-bold text-ink">Company information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Company name" optional={!isContractor} required={isContractor} value={f.companyName} onChange={set("companyName")} autoComplete="organization" />
          <TextField label="HST / business number" optional value={f.hstNumber} onChange={set("hstNumber")} />
        </div>
      </section>
      <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
        <h2 className="mb-5 font-display text-lg font-bold text-ink">Communication preferences</h2>
        <ChoiceCards
          name="preferredContact"
          legend="Preferred contact method"
          value={f.preferredContact}
          onChange={(v) => {
            setSaved(false);
            setF((x) => ({ ...x, preferredContact: v }));
          }}
          columns={3}
          options={[
            { value: "email", label: "Email", description: "Order & quote updates by email" },
            { value: "phone", label: "Phone call", description: "We'll call about quotes" },
            { value: "text", label: "Text message", description: "SMS updates (Stage 2)" },
          ]}
        />
        <Checkbox className="mt-5" label="Email me deals and new-product news" checked={f.marketingOptIn} onChange={(e) => setF((x) => ({ ...x, marketingOptIn: e.target.checked }))} />
      </section>
      <div className="flex items-center justify-end gap-4">
        {saved ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-success" role="status">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Changes saved
          </p>
        ) : null}
        <Button type="submit" loading={pending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
