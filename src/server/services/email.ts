import "server-only";
import type { EmailLogEntry, EmailTemplate } from "@/lib/types";
import { mutate, getDb, newId } from "@/server/db";

/**
 * EMAIL NOTIFICATIONS
 * -----------------------------------------------------------------------------
 * Prototype behaviour: every notification is rendered and recorded in the
 * notification log (visible in Admin → Email notifications) instead of being
 * delivered. To go live, implement `EmailProvider` for the chosen service
 * (Postmark, SendGrid, Amazon SES, Resend…) and select it with EMAIL_PROVIDER.
 */
export interface OutgoingEmail {
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  name: string;
  send(email: OutgoingEmail): Promise<"sent" | "failed">;
}

const simulatedProvider: EmailProvider = {
  name: "simulated",
  async send() {
    return "sent";
  },
};

function activeProvider(): EmailProvider {
  // Stage 2: switch on process.env.EMAIL_PROVIDER and return a real provider.
  return simulatedProvider;
}

export async function sendNotification(
  template: EmailTemplate,
  email: OutgoingEmail,
  relatedId?: string,
): Promise<EmailLogEntry> {
  const enabled = getDb().settings.emailNotifications[template] !== false;
  const provider = activeProvider();
  let status: EmailLogEntry["status"] = "disabled";
  if (enabled) {
    const result = await provider.send(email).catch(() => "failed" as const);
    status = result === "failed" ? "failed" : provider.name === "simulated" ? "simulated" : "sent";
  }
  const entry: EmailLogEntry = {
    id: newId("eml"),
    createdAt: new Date().toISOString(),
    template,
    to: email.to,
    subject: email.subject,
    body: email.body,
    status,
    relatedId,
  };
  mutate((db) => {
    db.emailLog.unshift(entry);
    db.emailLog = db.emailLog.slice(0, 300);
  });
  return entry;
}

export function adminEmail(): string {
  return getDb().settings.adminNotificationEmail;
}
