"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateContactStatusAction } from "@/app/actions/admin";

export function MessageStatus({ id, status }: { id: string; status: "new" | "in_progress" | "resolved" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Message status"
      value={status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await updateContactStatusAction(id, e.target.value as typeof status);
          router.refresh();
        })
      }
      className="field-input min-h-9! w-36 py-1.5! text-sm"
    >
      <option value="new">New</option>
      <option value="in_progress">In progress</option>
      <option value="resolved">Resolved</option>
    </select>
  );
}
