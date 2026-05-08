"use client";

import { useEffect } from "react";

import { useCartStore } from "@/lib/stores/cart-store";

// 주문 완료 페이지에 도달했다는 건 결제 처리가 끝났다는 의미.
// 사용자가 새로고침하거나 뒤로가기 후 재진입해도 카트에 잔재 항목이
// 남지 않도록 마운트 시점에 한 번 비운다.
export function CartCleanupOnMount() {
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
