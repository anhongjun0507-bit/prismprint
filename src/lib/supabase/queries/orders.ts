import { createClient } from "@/lib/supabase/server";

import type { Database } from "@/types/database";

export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow =
  Database["public"]["Tables"]["order_items"]["Row"];

export interface OrderLookupResult {
  order: OrderRow;
  items: OrderItemRow[];
}

// 비회원 주문 조회 — 주문번호 + 휴대폰 끝 4자리 동시 일치 시에만 반환.
// anon SELECT 가 RLS 로 허용되지만, 추측 차단을 위해 phone_last4 까지 매칭.
export async function findOrderForLookup(
  orderNumber: string,
  phoneLast4: string,
): Promise<OrderLookupResult | null> {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .eq("phone_last4", phoneLast4)
    .maybeSingle();
  if (error) {
    console.error("findOrderForLookup:", error);
    return null;
  }
  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .order("id");

  return { order: order as OrderRow, items: (items ?? []) as OrderItemRow[] };
}
