"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletterAction } from "@/app/actions/contact";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await subscribeNewsletterAction(email);
          setMessage(res.ok ? { ok: true, text: "Thanks — you're subscribed." } : { ok: false, text: res.error ?? "Please try again." });
          if (res.ok) setEmail("");
        });
      }}
      className="w-full"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="h-11 min-w-0 flex-1 rounded-l-md border border-r-0 border-ink-line bg-ink-soft px-4 text-sm text-white placeholder:text-muted focus:border-gold focus:outline-none"
        />
        <button type="submit" disabled={pending} className="h-11 shrink-0 rounded-r-md bg-gold px-4 text-sm font-semibold text-ink hover:bg-gold-dark disabled:opacity-60">
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      {message ? (
        <p className={message.ok ? "mt-2 text-sm text-gold" : "mt-2 text-sm text-danger-soft"} role="status">
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
