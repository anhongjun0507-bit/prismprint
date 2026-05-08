import Link from "next/link";

import {
  getAdminOrders,
  getAdminOrderStats,
  type AdminOrderStatus,
} from "@/lib/supabase/queries/admin-orders";

import { Button } from "@/components/ui/button";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { OrderListTable } from "@/components/admin/OrderListTable";

export const metadata = {
  title: "주문 관리",
};

interface SearchParams {
  status?: string;
  q?: string;
  range?: string;
  page?: string;
}

const VALID_STATUSES: ReadonlySet<string> = new Set([
  "all",
  "pending_payment",
  "paid",
  "preparing",
  "shipping",
  "delivered",
  "cancelled",
]);

function rangeToDateFrom(range: string): string | undefined {
  // KST 기준으로 시점 계산해 UTC ISO 로 반환.
  const now = new Date();
  if (range === "today") {
    const kstNow = new Date(now.getTime() + 9 * 3600 * 1000);
    const date = kstNow.toISOString().slice(0, 10);
    return new Date(`${date}T00:00:00+09:00`).toISOString();
  }
  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
  }
  if (range === "30d") {
    return new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
  }
  return undefined;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const statusParam = VALID_STATUSES.has(sp.status ?? "all")
    ? (sp.status as AdminOrderStatus | "all")
    : "all";
  const range = sp.range ?? "all";
  const q = sp.q ?? "";
  const pageParam = Number.parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [{ orders, total, totalPages }, stats] = await Promise.all([
    getAdminOrders({
      status: statusParam,
      searchQuery: q,
      dateFrom: rangeToDateFrom(range),
      page,
    }),
    getAdminOrderStats(),
  ]);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (statusParam !== "all") params.set("status", statusParam);
    if (q) params.set("q", q);
    if (range !== "all") params.set("range", range);
    if (p !== 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-xl font-bold md:text-2xl">주문 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          입금 확인·상태 변경·송장 입력을 처리합니다.
        </p>
      </header>

      <OrderFilters status={statusParam} query={q} range={range} stats={stats} />

      <div className="mt-6">
        <OrderListTable orders={orders} />
      </div>

      {total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            총 <span className="font-semibold text-foreground">{total}</span>건 ·{" "}
            {page}/{totalPages} 페이지
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <Link href={buildPageUrl(Math.max(1, page - 1))}>이전</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
            >
              <Link href={buildPageUrl(Math.min(totalPages, page + 1))}>
                다음
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
