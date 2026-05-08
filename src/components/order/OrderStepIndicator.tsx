import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "장바구니" },
  { id: 2, label: "주문서 작성" },
  { id: 3, label: "주문 완료" },
] as const;

export type OrderStep = 1 | 2 | 3;

interface OrderStepIndicatorProps {
  current: OrderStep;
}

export function OrderStepIndicator({ current }: OrderStepIndicatorProps) {
  return (
    <ol
      aria-label="주문 단계"
      className="flex flex-wrap items-center gap-2 text-xs sm:text-sm"
    >
      {STEPS.map((step, i) => (
        <li key={step.id} className="flex items-center gap-2">
          <span
            aria-current={step.id === current ? "step" : undefined}
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold",
              step.id === current
                ? "border-primary bg-primary text-primary-foreground"
                : step.id < current
                  ? "border-primary text-primary"
                  : "border-muted-foreground/30 text-muted-foreground/60",
            )}
          >
            {step.id}
          </span>
          <span
            className={cn(
              step.id === current
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          )}
        </li>
      ))}
    </ol>
  );
}
