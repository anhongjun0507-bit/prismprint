import Link from "next/link";
import {
  AlertCircle,
  Banknote,
  MessagesSquare,
  ShoppingBag,
} from "lucide-react";

import { getDashboardStats } from "@/lib/supabase/queries/admin-stats";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "관리자 대시보드",
};

interface StatCard {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  // 0 이 정상이면 false (오늘 주문 같은 통계). 0 이 좋으면 true (미답변 같은 잔무).
  zeroIsGood: boolean;
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards: StatCard[] = [
    {
      label: "입금 대기 주문",
      value: stats.pending_payment_count,
      href: "/admin/orders?status=pending_payment",
      icon: AlertCircle,
      zeroIsGood: true,
    },
    {
      label: "미확인 입금",
      value: stats.unconfirmed_deposits_count,
      href: "/admin/orders?tab=deposits",
      icon: Banknote,
      zeroIsGood: true,
    },
    {
      label: "미답변 Q&A",
      value: stats.unanswered_qna_count,
      href: "/admin/board",
      icon: MessagesSquare,
      zeroIsGood: true,
    },
    {
      label: "오늘 주문",
      value: stats.total_orders_today,
      href: "/admin/orders",
      icon: ShoppingBag,
      zeroIsGood: false,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-xl font-bold md:text-2xl">대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          입금 확인·문의 답변 등 처리해야 할 항목을 한눈에 확인하세요.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          // 0 이 좋은 카드 + 값 0 이면 회색, 그 외 값이 있으면 강조.
          const isUrgent = card.zeroIsGood && card.value > 0;
          const isMuted = card.zeroIsGood && card.value === 0;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={cn(
                "group flex flex-col gap-3 rounded-lg border bg-background p-5 transition-shadow hover:shadow-md",
                isUrgent && "border-amber-300 bg-amber-50",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {card.label}
                </span>
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isUrgent
                      ? "text-amber-600"
                      : isMuted
                        ? "text-muted-foreground/40"
                        : "text-primary",
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-3xl font-bold tabular-nums md:text-4xl",
                  isUrgent
                    ? "text-amber-700"
                    : isMuted
                      ? "text-muted-foreground/50"
                      : "text-foreground",
                )}
              >
                {card.value}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
