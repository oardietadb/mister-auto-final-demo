"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ListingPage } from "@/components/storefront";

function Results() {
  const params = useSearchParams();
  return <ListingPage query={params.get("q") ?? ""} />;
}

export default function Page() {
  return <Suspense fallback={<div className="page-width section-page">Chargement des résultats…</div>}><Results /></Suspense>;
}
