import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  pending_payment_count: number;
  unconfirmed_deposits_count: number;
  unanswered_qna_count: number;
  total_orders_today: number;
}

// KST 기준 오늘 0시 (UTC 로 환산해서 created_at 비교).
// to_char/timestamptz 변환은 PG 단에서 하지 않고 JS 에서 KST 자정을 계산.
function startOfTodayKstAsUtcIso(): string {
  const now = new Date();
  // UTC+9 = KST. 현재 시각을 KST 로 본 뒤, 그 날짜의 00:00:00 KST 를 UTC 로 변환.
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffsetMs);
  // YYYY-MM-DD 추출 후 그 날짜의 KST 00:00 을 UTC 로 환산.
  const kstDate = kstNow.toISOString().slice(0, 10);
  // KST 자정을 UTC 로 표현하면 -9 시간 → 전날 15:00 UTC.
  const kstMidnightUtc = new Date(`${kstDate}T00:00:00+09:00`);
  return kstMidnightUtc.toISOString();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const todayKstStart = startOfTodayKstAsUtcIso();

  const [
    pendingPayment,
    unconfirmedDeposits,
    unansweredQna,
    todayOrders,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_payment"),
    supabase
      .from("deposits")
      .select("id", { count: "exact", head: true })
      .eq("confirmed", false),
    supabase
      .from("qna_posts")
      .select("id", { count: "exact", head: true })
      .eq("is_answered", false),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayKstStart),
  ]);

  return {
    pending_payment_count: pendingPayment.count ?? 0,
    unconfirmed_deposits_count: unconfirmedDeposits.count ?? 0,
    unanswered_qna_count: unansweredQna.count ?? 0,
    total_orders_today: todayOrders.count ?? 0,
  };
}
