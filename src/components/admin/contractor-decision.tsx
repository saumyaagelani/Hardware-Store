"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { ContractorStatus } from "@/lib/types";
import { decideContractorAction } from "@/app/actions/admin";
import { TextareaField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";

export function ContractorDecision({ userId, status }: { userId: string; status: ContractorStatus }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const decide = (decision: ContractorStatus) =>
    start(async () => {
      const res = await decideContractorAction(userId, decision, note);
      if (res.ok) {
        setMsg(decision === "approved" ? "Approved — contractor pricing is now active for this account. Approval email sent (simulated)." : decision === "rejected" ? "Application rejected. Customer notified (simulated)." : "Moved back to pending review.");
        setNote("");
        router.refresh();
      } else setMsg(res.error ?? "Something went wrong");
    });
  return (
    <div className="space-y-3">
      <TextareaField label={status === "pending" ? "Decision note" : "Note"} optional rows={3} value={note} onChange={(e) => setNote(e.target.value)} hint="Included in the email to the applicant." />
      {status !== "approved" ? (
        <Button variant="dark" className="w-full" loading={pending} onClick={() => decide("approved")}>
          <CheckCircle2 className="h-4.5 w-4.5 text-gold" aria-hidden /> Approve contractor
        </Button>
      ) : null}
      {status !== "rejected" ? (
        <Button variant="outline" className="w-full" disabled={pending} onClick={() => decide("rejected")}>
          <XCircle className="h-4.5 w-4.5" aria-hidden /> {status === "approved" ? "Revoke & reject" : "Reject application"}
        </Button>
      ) : null}
      {status !== "pending" ? (
        <Button variant="ghost" className="w-full" disabled={pending} onClick={() => decide("pending")}>
          <RotateCcw className="h-4 w-4" aria-hidden /> Return to pending
        </Button>
      ) : null}
      {msg ? (
        <p className="rounded-md bg-success-soft p-3 text-sm text-success" role="status">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
