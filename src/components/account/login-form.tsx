"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { TextField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";

export interface DemoCredential {
  label: string;
  email: string;
}

export function LoginForm({ next, demoAccounts, demoPassword }: { next?: string; demoAccounts?: DemoCredential[]; demoPassword?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setErrors({});
          start(async () => {
            const res = await loginAction({ email, password, next });
            if (res.ok) {
              router.push(res.redirectTo);
              router.refresh();
            } else {
              setErrors(res.fieldErrors ?? {});
              setError(res.error ?? null);
            }
          });
        }}
        className="space-y-4"
      >
        {error ? (
          <p role="alert" className="flex items-center gap-2 rounded-md bg-danger-soft p-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {error}
          </p>
        ) : null}
        <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <TextField label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="flex justify-end">
          <span className="text-xs text-body" title="Password reset emails are a Stage 2 feature">
            Forgot password? Contact us to reset (online reset coming soon)
          </span>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={pending}>
          Sign in
        </Button>
      </form>

      {demoAccounts?.length ? (
        <div className="mt-8 rounded-lg border border-dashed border-gold-dark bg-gold-soft p-4">
          <p className="text-sm font-semibold text-ink">Demo accounts</p>
          <p className="mt-0.5 text-xs text-body">
            Password for all: <code className="font-semibold text-ink">{demoPassword}</code> — click to fill.
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {demoAccounts.map((a) => (
              <li key={a.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(demoPassword ?? "");
                  }}
                  className="w-full rounded-md bg-white px-3 py-2 text-left ring-1 ring-line hover:ring-ink"
                >
                  <span className="block text-xs font-semibold text-ink">{a.label}</span>
                  <span className="block truncate text-[0.6875rem] text-body">{a.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
