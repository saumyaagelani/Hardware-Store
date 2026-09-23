import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Your Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page py-6 lg:py-8">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <h1 className="mt-5 mb-6 text-3xl font-extrabold text-ink sm:text-4xl">Shopping cart</h1>
      <CartView />
    </div>
  );
}
