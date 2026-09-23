"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import type { OrderStatus, QuoteStatus } from "@/lib/types";
import { confirmDeliveryFeeAction, updateOrderStatusAction, updateQuoteAction } from "@/app/actions/admin";
import { orderStatusMeta, orderStatusOrder, quoteStatusMeta, quoteStatusOrder } from "@/lib/status";
import { Checkbox, SelectField, TextField, TextareaField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";

export function OrderStatusControl({ orderId, status, feeToBeConfirmed }: { orderId: string; status: OrderStatus; feeToBeConfirmed: boolean }) {
  const router = useRouter();
  const [next, setNext] = useState<OrderStatus>(status);
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [fee, setFee] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-5">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await updateOrderStatusAction(orderId, next, note, notify);
            setMsg(res.ok ? "Order updated" : (res.error ?? "Update failed"));
            if (res.ok) {
              setNote("");
              router.refresh();
            }
          });
        }}
      >
        <SelectField label="Order status" value={next} onChange={(e) => setNext(e.target.value as OrderStatus)} options={orderStatusOrder.map((s) => ({ value: s, label: orderStatusMeta[s].label }))} />
        <TextareaField label="Note" optional rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note / message to customer" />
        <Checkbox label="Email the customer about this update" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
        <Button type="submit" variant="dark" className="w-full" loading={pending} disabled={next === status && !note}>
          Update order
        </Button>
      </form>
      {feeToBeConfirmed ? (
        <form
          className="space-y-3 border-t border-line pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await confirmDeliveryFeeAction(orderId, Number(fee));
              setMsg(res.ok ? "Delivery fee confirmed and totals updated" : (res.error ?? "Failed"));
              if (res.ok) router.refresh();
            });
          }}
        >
          <TextField label="Confirm delivery fee ($)" type="number" min={0} step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} hint="Oversized order — fee was marked “to be confirmed”." />
          <Button type="submit" variant="outline" className="w-full" disabled={!fee || pending}>
            Confirm fee
          </Button>
        </form>
      ) : null}
      {msg ? (
        <p className="flex items-center gap-1.5 text-sm text-success" role="status">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {msg}
        </p>
      ) : null}
    </div>
  );
}

export function QuoteStatusControl({ quoteId, status, quotedAmount, adminNotes }: { quoteId: string; status: QuoteStatus; quotedAmount?: number; adminNotes?: string }) {
  const router = useRouter();
  const [next, setNext] = useState<QuoteStatus>(status);
  const [amount, setAmount] = useState(quotedAmount?.toString() ?? "");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [notify, setNotify] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        start(async () => {
          const res = await updateQuoteAction(quoteId, { status: next, note, quotedAmount: amount ? Number(amount) : null, adminNotes: notes, notify });
          if (res.ok) {
            setErrors({});
            setNote("");
            setMsg(next !== status && notify ? "Quote updated — customer notified (simulated email)" : "Quote updated");
            router.refresh();
          } else {
            setErrors(res.fieldErrors ?? {});
            setMsg(null);
          }
        });
      }}
    >
      <SelectField label="Quote status" value={next} onChange={(e) => setNext(e.target.value as QuoteStatus)} options={quoteStatusOrder.map((s) => ({ value: s, label: quoteStatusMeta[s].label }))} />
      <TextField label="Quoted amount ($, before tax)" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.quotedAmount} optional={next !== "quoted"} />
      <TextareaField label="Message to customer" optional rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={next === "info_required" ? "What information do you need?" : "Optional note added to the status update"} />
      <TextareaField label="Internal notes" optional rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} hint="Only visible to staff" />
      <Checkbox label="Email the customer about status changes" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
      <Button type="submit" variant="dark" className="w-full" loading={pending}>
        Save quote
      </Button>
      {msg ? (
        <p className="flex items-center gap-1.5 text-sm text-success" role="status">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {msg}
        </p>
      ) : null}
    </form>
  );
}
