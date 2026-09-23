import { env } from "@/config/env";
import { DEMO_ACCOUNTS } from "@/data/seed/people";
import { getCurrentUser } from "@/server/auth/session";
import { DemoToolbar } from "./demo-toolbar";

export async function DemoToolbarServer() {
  if (!env.demoMode) return null;
  const user = await getCurrentUser();
  const current = user ? (DEMO_ACCOUNTS.find((a) => a.userId === user.id)?.key ?? "other") : null;
  return <DemoToolbar current={current} />;
}
