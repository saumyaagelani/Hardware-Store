import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HardHat, ShieldAlert, UserPlus } from "lucide-react";
import { getCurrentUser, isStaff } from "@/server/auth/session";
import { LoginForm } from "@/components/account/login-form";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/data/seed/people";
import { env } from "@/config/env";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/account/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const denied = params.denied === "1";
  const user = await getCurrentUser();
  if (user && !denied) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : isStaff(user) ? "/admin" : "/account");

  return (
    <div className="bg-canvas">
      <div className="container-page grid max-w-5xl gap-6 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-16">
        <div className="rounded-lg border border-line bg-white p-6 sm:p-10">
          <h1 className="text-3xl font-extrabold text-ink">Sign in</h1>
          <p className="mt-1 mb-6 text-body">Access your orders, quotes and saved addresses.</p>
          {denied ? (
            <p className="mb-5 flex items-start gap-2 rounded-md bg-warning-soft p-3 text-sm text-warning">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> That area is for staff accounts only. Sign in with an administrator account to continue.
            </p>
          ) : null}
          <LoginForm next={next} demoAccounts={env.demoMode ? DEMO_ACCOUNTS.map(({ label, email }) => ({ label, email })) : undefined} demoPassword={env.demoMode ? DEMO_PASSWORD : undefined} />
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
            <UserPlus className="h-7 w-7 text-gold-dark" aria-hidden />
            <h2 className="mt-3 font-display text-xl font-bold text-ink">New customer?</h2>
            <p className="mt-1 text-sm text-body">Create an account to track orders and quotes, save delivery addresses and check out faster. You can always check out as a guest.</p>
            <ButtonLink href="/account/register" variant="dark" className="mt-5">
              Create an account
            </ButtonLink>
          </div>
          <div className="rounded-lg bg-ink p-6 text-white sm:p-8">
            <HardHat className="h-7 w-7 text-gold" aria-hidden />
            <h2 className="mt-3 font-display text-xl font-bold">Contractor or trade business?</h2>
            <p className="mt-1 text-sm text-white/70">Apply for a trade account to unlock contractor pricing, project quotes and job-site delivery.</p>
            <Link href="/contractors/apply" className="mt-5 inline-flex h-11 items-center rounded-md bg-gold px-5 text-sm font-semibold text-ink hover:bg-gold-dark">
              Apply for a contractor account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
