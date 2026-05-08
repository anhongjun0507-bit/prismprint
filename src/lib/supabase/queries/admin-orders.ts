import { createClient } from "@/lib/supabase/server";

import type { Database } from "@/types/database";

export type AdminOrder = Database["public"]["Tables"]["orders"]["Row"];
export type AdminOrderItem =
  Database["public"]["Tables"]["order_items"]["Row"];
export type AdminDeposit = Database["public"]["Tables"]["deposits"]["Row"];

export type AdminOrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "shipping"
  | "delivered"
  | "cancelled";

export const ADMIN_ORDERS_PER_PAGE = 20;

export interface AdminOrdersFilters {
  status?: AdminOrderStatus | "all";
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}

export interface AdminOrdersResult {
  orders: AdminOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAdminOrders(
  filters: AdminOrdersFilters = {},
): Promise<AdminOrdersResult> {
  const supabase = await createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const from = (page - 1) * ADMIN_ORDERS_PER_PAGE;
  const to = from + ADMIN_ORDERS_PER_PAGE - 1;

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  if (filters.searchQuery) {
    const q = filters.searchQuery.trim();
    if (q.length > 0) {
      // 주문번호 / 받는 사람 / 휴대폰 동시 검색
      query = query.or(
        `order_number.ilike.%${q}%,recipient_name.ilike.%${q}%,recipient_phone.ilike.%${q}%`,
      );
    }
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("Failed to fetch admin orders:", error);
    return { orders: [], total: 0, page, totalPages: 1 };
  }

  const total = count ?? 0;
  return {
    orders: (data ?? []) as AdminOrder[],
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_ORDERS_PER_PAGE)),
  };
}

export interface AdminOrderDetail {
  order: AdminOrder;
  items: AdminOrderItem[];
  deposit: AdminDeposit | null;
}

export async function getAdminOrderDetail(
  orderId: string,
): Promise<AdminOrderDetail | null> {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const [{ data: items }, { data: deposit }] = await Promise.all([
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("id"),
    supabase
      .from("deposits")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle(),
  ]);

  return {
    order: order as AdminOrder,
    items: (items ?? []) as AdminOrderItem[],
    deposit: (deposit as AdminDeposit | null) ?? null,
  };
}

export type AdminOrderStats = Record<AdminOrderStatus | "all", number>;

const ALL_STATUSES: AdminOrderStatus[] = [
  "pending_payment",
  "paid",
  "preparing",
  "shipping",
  "delivered",
  "cancelled",
];

export async function getAdminOrderStats(): Promise<AdminOrderStats> {
  const supabase = await createClient();
  const queries = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    ...ALL_STATUSES.map((s) =>
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", s),
    ),
  ]);

  const stats: AdminOrderStats = {
    all: queries[0].count ?? 0,
    pending_payment: 0,
    paid: 0,
    preparing: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
  };
  ALL_STATUSES.forEach((s, i) => {
    stats[s] = queries[i + 1].count ?? 0;
  });
  return stats;
}
