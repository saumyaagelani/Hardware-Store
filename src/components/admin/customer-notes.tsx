"use client";

import { useState, useTransition } from "react";
import { updateCustomerNotesAction } from "@/app/actions/admin";
import { TextareaField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";

export function CustomerNotes({ userId, initial }: { userId: string; initial?: string }) {
  const [notes, setNotes] = useState(initial ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3">
      <TextareaField label="Internal notes" rows={4} value={notes} onChange={(e) => { setSaved(false); setNotes(e.target.value); }} hint="Only visible to staff" />
      <div className="flex items-center justify-end gap-3">
        {saved ? <span className="text-sm text-success">Saved</span> : null}
        <Button size="sm" variant="dark" loading={pending} onClick={() => start(async () => { const r = await updateCustomerNotesAction(userId, notes); setSaved(r.ok); })}>
          Save notes
        </Button>
      </div>
    </div>
  );
}
