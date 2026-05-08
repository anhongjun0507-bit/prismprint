"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { toggleProductActiveAction } from "@/app/admin/(protected)/products/actions";

interface ProductActiveToggleProps {
  productId: string;
  isActive: boolean;
}

export function ProductActiveToggle({
  productId,
  isActive: initialActive,
}: ProductActiveToggleProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(initialActive);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: boolean) {
    setOptimistic(next);
    setError(null);
    startTransition(async () => {
      const res = await toggleProductActiveAction(productId, next);
      if (!res.ok) {
        setOptimistic(!next);
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-input"
        checked={optimistic}
        disabled={pending}
        onChange={(e) => handleChange(e.target.checked)}
      />
      <span className={optimistic ? "text-emerald-700" : "text-muted-foreground"}>
        {optimistic ? "활성" : "비활성"}
      </span>
      {error && <span className="text-destructive">!</span>}
    </label>
  );
}
