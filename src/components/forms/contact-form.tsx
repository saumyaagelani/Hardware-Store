"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitContactAction } from "@/app/actions/contact";
import { track } from "@/lib/analytics";
import { SelectField, TextField, TextareaField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";

export function ContactForm({ initial }: { initial: { name: string; email: string; phone: string } }) {
  const [f, setF] = useState({ ...initial, topic: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  if (sent) {
    return (
      <div className="rounded-lg bg-success-soft p-6 text-center" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden />
        <p className="mt-3 font-display text-xl font-bold text-ink">Message sent — thank you!</p>
        <p className="mt-1 text-sm text-body">We usually reply within one business day.</p>
        <Button variant="outline" className="mt-5" onClick={() => { setSent(false); setF({ ...initial, topic: "", message: "" }); }}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await submitContactAction(f);
          if (res.ok) {
            track("generate_lead", { form: "contact" });
            setSent(true);
          } else setErrors(res.fieldErrors ?? {});
        });
      }}
    >
      <TextField label="Name" required autoComplete="name" value={f.name} onChange={set("name")} error={errors.name} />
      <TextField label="Email" type="email" required autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
      <TextField label="Phone" type="tel" optional autoComplete="tel" value={f.phone} onChange={set("phone")} error={errors.phone} />
      <SelectField
        label="Topic"
        required
        placeholder="Choose a topic…"
        value={f.topic}
        onChange={set("topic")}
        error={errors.topic}
        options={["Product question", "Order status", "Delivery", "Returns", "Contractor account", "Other"].map((v) => ({ value: v, label: v }))}
      />
      <TextareaField containerClassName="sm:col-span-2" label="Message" required rows={5} value={f.message} onChange={set("message")} error={errors.message} />
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" size="lg" loading={pending}>
          Send message
        </Button>
      </div>
    </form>
  );
}
