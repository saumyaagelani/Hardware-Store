"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { track } from "@/lib/analytics";
import { AddressFields, emptyAddress, type AddressValue } from "@/components/forms/address-fields";
import { Checkbox, ChoiceCards, TextField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import type { ContactMethod } from "@/lib/types";

export function RegisterForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [f, setF] = useState({ fullName: "", email: initialEmail, phone: "", password: "", confirmPassword: "", companyName: "", hstNumber: "" });
  const [preferredContact, setPreferredContact] = useState<ContactMethod>("email");
  const [billing, setBilling] = useState<AddressValue>(emptyAddress);
  const [delivery, setDelivery] = useState<AddressValue>(emptyAddress);
  const [sameDelivery, setSameDelivery] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setErrors({});
        setError(null);
        start(async () => {
          const res = await registerAction({ ...f, preferredContact, billing, sameDelivery, delivery: sameDelivery ? undefined : delivery, marketingOptIn });
          if (res.ok) {
            track("sign_up", { method: "email" });
            router.push(res.redirectTo);
            router.refresh();
          } else {
            setErrors(res.fieldErrors ?? {});
            setError(res.error ?? "Please check the highlighted fields.");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
      }}
      className="space-y-8"
    >
      {error ? (
        <p role="alert" className="flex items-center gap-2 rounded-md bg-danger-soft p-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {error}
        </p>
      ) : null}
      <fieldset className="space-y-4">
        <legend className="mb-4 font-display text-lg font-bold text-ink">Your details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Full name" required autoComplete="name" value={f.fullName} onChange={set("fullName")} error={errors.fullName} />
          <TextField label="Phone" type="tel" required autoComplete="tel" value={f.phone} onChange={set("phone")} error={errors.phone} />
          <TextField containerClassName="sm:col-span-2" label="Email" type="email" required autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
          <TextField label="Password" type="password" required autoComplete="new-password" value={f.password} onChange={set("password")} error={errors.password} hint="8+ characters with a letter and a number" />
          <TextField label="Confirm password" type="password" required autoComplete="new-password" value={f.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
          <TextField label="Company name" optional autoComplete="organization" value={f.companyName} onChange={set("companyName")} />
          <TextField label="HST / business number" optional value={f.hstNumber} onChange={set("hstNumber")} />
        </div>
        <ChoiceCards
          name="contact"
          legend="Preferred contact method"
          value={preferredContact}
          onChange={setPreferredContact}
          columns={3}
          options={[
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "text", label: "Text message" },
          ]}
        />
      </fieldset>
      <fieldset>
        <legend className="mb-4 font-display text-lg font-bold text-ink">Billing address</legend>
        <AddressFields prefix="billing" value={billing} onChange={setBilling} errors={errors} />
        <Checkbox className="mt-4" label="Use this as my delivery address" checked={sameDelivery} onChange={(e) => setSameDelivery(e.target.checked)} />
      </fieldset>
      {!sameDelivery ? (
        <fieldset>
          <legend className="mb-4 font-display text-lg font-bold text-ink">Delivery address</legend>
          <AddressFields prefix="delivery" value={delivery} onChange={setDelivery} errors={errors} />
        </fieldset>
      ) : null}
      <Checkbox label="Send me occasional deals and new-product news" checked={marketingOptIn} onChange={(e) => setMarketingOptIn(e.target.checked)} />
      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-body">
          Already have an account? <Link href="/account/login" className="font-semibold text-ink underline">Sign in</Link>
        </p>
        <Button type="submit" size="lg" loading={pending}>
          Create account
        </Button>
      </div>
    </form>
  );
}
