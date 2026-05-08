import { cn } from "@/lib/utils";

import type { OrderStatus } from "@/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "입금 대기",
  paid: "입금 확인",
  preparing: "제작 중",
  shipping: "배송 중",
  delivered: "배송 완료",
  cancelled: "주문 취소",
};

const STATUS_TONE: Record<OrderStatus, string> = {
  pending_payment: "border-amber-200 bg-amber-50 text-amber-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  preparing: "border-sky-200 bg-sky-50 text-sky-700",
  shipping: "border-indigo-200 bg-indigo-50 text-indigo-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_TONE[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
