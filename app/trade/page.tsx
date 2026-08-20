"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TradeDashboard = dynamic(() => import("./TradeDashboard"), {
  ssr: false,
});

function TradePageContent() {
  const searchParams = useSearchParams();
  const asset = searchParams.get("asset") || "BTC";
  return <TradeDashboard initialAsset={asset} />;
}

export default function TradePage() {
  return (
    <Suspense fallback={<div className="h-[80vh] flex items-center justify-center text-muted-foreground">Loading trading panel...</div>}>
      <TradePageContent />
    </Suspense>
  );
}