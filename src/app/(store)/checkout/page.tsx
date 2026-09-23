import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { getCurrentUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { CheckoutForm, type CheckoutUser } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const settings = getDb().settings;
  const checkoutUser: CheckoutUser | null = user
    ? {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        companyName: user.companyName,
        billingAddress: user.billingAddress,
        deliveryAddresses: user.deliveryAddresses,
      }
    : null;
  return (
    <div className="bg-canvas">
      <div className="container-page py-6 lg:py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Checkout</h1>
          <p className="flex items-center gap-1.5 text-sm text-body">
            <Lock className="h-4 w-4 text-success" aria-hidden /> Secure checkout
          </p>
        </div>
        <CheckoutForm user={checkoutUser} pickupLocations={settings.pickupLocations.filter((l) => l.active)} taxRate={settings.taxRate} taxLabel={settings.taxLabel} />
      </div>
    </div>
  );
}
