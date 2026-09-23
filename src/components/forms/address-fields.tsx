"use client";

import { SelectField, TextField } from "@/components/ui/fields";

export interface AddressValue {
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export const emptyAddress: AddressValue = { line1: "", line2: "", city: "", province: "ON", postalCode: "", country: "Canada" };

export const provinces = [
  ["AB", "Alberta"],
  ["BC", "British Columbia"],
  ["MB", "Manitoba"],
  ["NB", "New Brunswick"],
  ["NL", "Newfoundland and Labrador"],
  ["NS", "Nova Scotia"],
  ["NT", "Northwest Territories"],
  ["NU", "Nunavut"],
  ["ON", "Ontario"],
  ["PE", "Prince Edward Island"],
  ["QC", "Quebec"],
  ["SK", "Saskatchewan"],
  ["YT", "Yukon"],
].map(([value, label]) => ({ value, label }));

export function AddressFields({
  value,
  onChange,
  errors = {},
  prefix,
  onPostalBlur,
}: {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  errors?: Record<string, string | undefined>;
  /** Error key prefix, e.g. "billing" → looks up "billing.line1". */
  prefix: string;
  onPostalBlur?: (postal: string) => void;
}) {
  const set = (key: keyof AddressValue) => (e: { target: { value: string } }) => onChange({ ...value, [key]: e.target.value });
  const err = (key: string) => errors[`${prefix}.${key}`];
  return (
    <div className="grid gap-4 sm:grid-cols-6">
      <TextField containerClassName="sm:col-span-6" label="Street address" required autoComplete={`${prefix === "billing" ? "billing" : "shipping"} address-line1`} value={value.line1} onChange={set("line1")} error={err("line1")} />
      <TextField containerClassName="sm:col-span-6" label="Apartment, unit, suite" optional autoComplete={`${prefix === "billing" ? "billing" : "shipping"} address-line2`} value={value.line2} onChange={set("line2")} error={err("line2")} />
      <TextField containerClassName="sm:col-span-2" label="City" required autoComplete={`${prefix === "billing" ? "billing" : "shipping"} address-level2`} value={value.city} onChange={set("city")} error={err("city")} />
      <SelectField containerClassName="sm:col-span-2" label="Province" required options={provinces} value={value.province} onChange={set("province")} error={err("province")} />
      <TextField
        containerClassName="sm:col-span-2"
        label="Postal code"
        required
        autoComplete={`${prefix === "billing" ? "billing" : "shipping"} postal-code`}
        value={value.postalCode}
        onChange={(e) => onChange({ ...value, postalCode: e.target.value.toUpperCase() })}
        onBlur={() => onPostalBlur?.(value.postalCode)}
        maxLength={7}
        error={err("postalCode")}
      />
    </div>
  );
}
