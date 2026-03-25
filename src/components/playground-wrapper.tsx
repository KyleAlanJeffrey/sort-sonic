"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Playground } from "./playground";

function PlaygroundInner() {
  const searchParams = useSearchParams();
  const algorithm = searchParams.get("algorithm") ?? undefined;

  return <Playground initialAlgorithmSlug={algorithm} />;
}

export function PlaygroundWrapper() {
  return (
    <Suspense>
      <PlaygroundInner />
    </Suspense>
  );
}
