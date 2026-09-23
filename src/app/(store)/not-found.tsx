import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <EmptyState icon={SearchX} title="We couldn't find that page" description="The page or product may have moved or is no longer available. Try searching or browse our departments.">
        <ButtonLink href="/shop" variant="dark">
          Browse products
        </ButtonLink>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </EmptyState>
    </div>
  );
}
