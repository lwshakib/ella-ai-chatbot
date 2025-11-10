"use client";
import { PricingTable } from "@clerk/nextjs";

export default function BillingPage() {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl p-4">
        <PricingTable />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          After purchasing, refresh the page and continue.
        </p>
      </div>
    </div>
  );
}
