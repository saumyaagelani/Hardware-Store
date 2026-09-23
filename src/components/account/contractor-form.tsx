"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, Lock } from "lucide-react";
import { applyContractorAction } from "@/app/actions/contractor";
import { track } from "@/lib/analytics";
import { AddressFields, emptyAddress, type AddressValue } from "@/components/forms/address-fields";
import { Checkbox, ChoiceCards, SelectField, TextField, TextareaField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import type { ContactMethod } from "@/lib/types";

export interface ContractorPrefill {
  contactName: string;
  email: string;
  phone: string;
  companyName: string;
  hstNumber: string;
  businessAddress?: AddressValue;
}

export function ContractorForm({ prefill, signedIn }: { prefill: ContractorPrefill; signedIn: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [f, setF] = useState({
    contactName: prefill.contactName,
    email: prefill.email,
    phone: prefill.phone,
    companyName: prefill.companyName,
    businessType: "",
    yearsInBusiness: "",
    hstNumber: prefill.hstNumber,
    tradeLicence: "",
    website: "",
    estimatedMonthlySpend: "",
    notes: "",
    password: "",
    confirmPassword: "",
  });
  const [address, setAddress] = useState<AddressValue>(prefill.businessAddress ?? emptyAddress);
  const [preferredContact, setPreferredContact] = useState<ContactMethod>("email");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <form
      noValidate
      className="space-y-9"
      onSubmit={(e) => {
        e.preventDefault();
        setErrors({});
        setError(null);
        start(async () => {
          const res = await applyContractorAction({ ...f, preferredContact, businessAddress: address, agree });
          if (res.ok) {
            track("sign_up", { method: "contractor_application" });
            router.push(res.redirectTo);
            router.refresh();
          } else {
            setErrors(res.fieldErrors ?? {});
            setError(res.error ?? "Please check the highlighted fields.");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
      }}
    >
      {error ? (
        <p role="alert" className="flex items-center gap-2 rounded-md bg-danger-soft p-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {error}
        </p>
      ) : null}

      <fieldset>
        <legend className="mb-1 font-display text-xl font-bold text-ink">1. Contact</legend>
        <p className="mb-5 text-sm text-body">The main person we&apos;ll work with on your account.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Contact name" required autoComplete="name" value={f.contactName} onChange={set("contactName")} error={errors.contactName} />
          <TextField label="Phone" type="tel" required autoComplete="tel" value={f.phone} onChange={set("phone")} error={errors.phone} />
          <TextField containerClassName="sm:col-span-2" label="Email" type="email" required autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} disabled={signedIn} hint={signedIn ? "Your signed-in account will be upgraded." : undefined} />
        </div>
        <div className="mt-5">
          <ChoiceCards
            name="preferredContact"
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
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 font-display text-xl font-bold text-ink">2. Business</legend>
        <p className="mb-5 text-sm text-body">Used to verify your business. Details marked optional can be added later.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField containerClassName="sm:col-span-2" label="Company / business name" required autoComplete="organization" value={f.companyName} onChange={set("companyName")} error={errors.companyName} />
          <SelectField
            label="Business type"
            required
            placeholder="Select…"
            value={f.businessType}
            onChange={set("businessType")}
            error={errors.businessType}
            options={["General contractor / renovations", "Flooring installer", "Tile & bathroom installer", "Carpenter / finishing", "Plumber", "Property management", "Builder / developer", "Interior design", "Other trade"].map((v) => ({ value: v, label: v }))}
          />
          <SelectField label="Years in business" optional placeholder="Select…" value={f.yearsInBusiness} onChange={set("yearsInBusiness")} options={["Less than 1", "1–2", "3–5", "6–10", "10+"].map((v) => ({ value: v, label: v }))} />
          <TextField label="HST / business number" optional value={f.hstNumber} onChange={set("hstNumber")} placeholder="e.g. 12345 6789 RT0001" />
          <TextField label="Trade licence / registration #" optional value={f.tradeLicence} onChange={set("tradeLicence")} />
          <TextField label="Website or social page" optional value={f.website} onChange={set("website")} />
          <SelectField label="Estimated monthly purchases" optional placeholder="Select…" value={f.estimatedMonthlySpend} onChange={set("estimatedMonthlySpend")} options={["Under $2,000", "$2,000 – $5,000", "$5,000 – $15,000", "$15,000+"].map((v) => ({ value: v, label: v }))} />
        </div>
        <p className="mt-6 mb-3 text-sm font-semibold text-ink">Business address</p>
        <AddressFields prefix="businessAddress" value={address} onChange={setAddress} errors={errors} />
        <TextareaField containerClassName="mt-4" label="Tell us about your work" optional value={f.notes} onChange={set("notes")} rows={3} placeholder="Typical projects, products you buy most, service area…" />
      </fieldset>

      {!signedIn ? (
        <fieldset>
          <legend className="mb-1 font-display text-xl font-bold text-ink">3. Account login</legend>
          <p className="mb-5 text-sm text-body">You&apos;ll use this to sign in and see contractor pricing once approved.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Password" type="password" required autoComplete="new-password" value={f.password} onChange={set("password")} error={errors.password} hint="8+ characters with a letter and a number" />
            <TextField label="Confirm password" type="password" required autoComplete="new-password" value={f.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
          </div>
        </fieldset>
      ) : null}

      <div className="rounded-lg bg-mist p-4">
        <Checkbox
          label="I confirm these details are accurate and agree to the trade account terms."
          description="Contractor pricing is available once your application is approved by our team."
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        {errors.agree ? <p className="field-error ml-7">{errors.agree}</p> : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-xs text-body">
          <Lock className="h-3.5 w-3.5" aria-hidden /> Your information is only used to review your application. <Link href="/policies/privacy" className="underline">Privacy</Link>
        </p>
        <Button type="submit" size="lg" loading={pending}>
          Submit application
        </Button>
      </div>
    </form>
  );
}
