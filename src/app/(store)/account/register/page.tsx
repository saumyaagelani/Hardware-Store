import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HardHat } from "lucide-react";
import { getCurrentUser } from "@/server/auth/session";
import { RegisterForm } from "@/components/account/register-form";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: PageProps<"/account/register">) {
  if (await getCurrentUser()) redirect("/account");
  const { email } = await searchParams;
  return (
    <div className="bg-canvas">
      <div className="container-page max-w-3xl py-10 lg:py-14">
        <div className="rounded-lg border border-line bg-white p-6 sm:p-10">
          <h1 className="text-3xl font-extrabold text-ink">Create your account</h1>
          <p className="mt-1 text-body">For homeowners and customers shopping at retail pricing.</p>
          <p className="mt-4 mb-8 flex items-center gap-2 rounded-md bg-mist p-3 text-sm text-body">
            <HardHat className="h-4.5 w-4.5 shrink-0 text-gold-dark" aria-hidden />
            <span>
              Buying for a business? <Link href="/contractors/apply" className="font-semibold text-ink underline">Apply for a contractor account</Link> to unlock trade pricing.
            </span>
          </p>
          <RegisterForm initialEmail={typeof email === "string" ? email : ""} />
        </div>
      </div>
    </div>
  );
}
