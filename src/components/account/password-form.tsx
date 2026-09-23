"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { changePasswordAction } from "@/app/actions/account";
import { TextField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";

export function PasswordForm() {
  const [f, setF] = useState({ current: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(false);
        start(async () => {
          const res = await changePasswordAction(f);
          if (res.ok) {
            setDone(true);
            setErrors({});
            setF({ current: "", password: "", confirm: "" });
          } else setErrors(res.fieldErrors ?? {});
        });
      }}
    >
      <TextField label="Current password" type="password" autoComplete="current-password" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} error={errors.current} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="New password" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={errors.password} hint="8+ characters with a letter and a number" />
        <TextField label="Confirm new password" type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} error={errors.confirm} />
      </div>
      <div className="flex items-center justify-end gap-4">
        {done ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-success" role="status">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Password updated
          </p>
        ) : null}
        <Button type="submit" variant="dark" loading={pending}>
          Update password
        </Button>
      </div>
    </form>
  );
}
