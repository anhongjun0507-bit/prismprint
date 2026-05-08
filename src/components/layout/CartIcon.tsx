"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useHasMounted } from "@/hooks/useHasMounted";
import { useCartStore } from "@/lib/stores/cart-store";

export function CartIcon() {
  const hasMounted = useHasMounted();
  const itemCount = useCartStore((s) => s.items.length);
  const showBadge = hasMounted && itemCount > 0;

  return (
    <Link
      href="/cart"
      aria-label={
        showBadge ? `장바구니 (${itemCount}개)` : "장바구니"
      }
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
    >
      <ShoppingCart className="h-5 w-5" />
      {showBadge && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
