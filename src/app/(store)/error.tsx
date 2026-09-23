"use client";

import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button, ButtonLink } from "@/components/ui/button";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page py-16">
      <EmptyState icon={AlertTriangle} title="Something went wrong" description="We couldn't load this page. Please try again — if the problem continues, contact our team.">
        <Button variant="dark" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </EmptyState>
    </div>
  );
}
