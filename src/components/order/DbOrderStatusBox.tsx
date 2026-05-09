import { CheckCircle2, Home, Package, Truck, XCircle } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

import { DepositInfoBox } from "@/components/order/DepositInfoBox";

import type { Database } from "@/types/database";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

type Tone = "success" | "info" | "error";

const TONE_CLASSES: Record<Tone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  error: "border-destructive/30 bg-destructive/5 text-destructive",
};

interface DbOrderStatusBoxProps {
  order: OrderRow;
}

// orders 테이블 row 를 받아 status 별 알림 박스를 렌더한다.
export function DbOrderStatusBox({ order }: DbOrderStatusBoxProps) {
  switch (order.status) {
    case "pending_payment":
      return (
        <DepositInfoBox
          bankName={siteConfig.bank.name}
          accountNumber={siteConfig.bank.accountNumber}
          holder={siteConfig.bank.holder}
          amount={order.total_amount}
          depositorName={order.depositor_name}
          createdAt={order.created_at}
        />
      );
    case "paid":
      return (
        <SimpleStatusBox
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
          title="입금이 확인되었습니다"
          description="곧 제작이 시작됩니다."
        />
      );
    case "preparing":
      return (
        <SimpleStatusBox
          icon={<Package className="h-5 w-5" />}
          tone="info"
          title="제작 중입니다"
          description="평균 2~3일 정도 소요됩니다."
        />
      );
    case "shipping":
      return (
        <SimpleStatusBox
          icon={<Truck className="h-5 w-5" />}
          tone="info"
          title="배송 중입니다"
          description={
            order.tracking_number
              ? `송장번호: ${order.tracking_number}`
              : "배송 완료까지 1~2일 정도 소요될 수 있습니다."
          }
        />
      );
    case "delivered":
      return (
        <SimpleStatusBox
          icon={<Home className="h-5 w-5" />}
          tone="success"
          title="배송이 완료되었습니다"
          description={
            order.tracking_number
              ? `송장번호: ${order.tracking_number}`
              : "이용해주셔서 감사합니다."
          }
        />
      );
    case "cancelled":
      return (
        <SimpleStatusBox
          icon={<XCircle className="h-5 w-5" />}
          tone="error"
          title="취소된 주문입니다"
          description="자세한 사항은 고객센터로 문의 주세요."
        />
      );
    default:
      return null;
  }
}

interface SimpleStatusBoxProps {
  icon: React.ReactNode;
  tone: Tone;
  title: string;
  description: string;
}

function SimpleStatusBox({
  icon,
  tone,
  title,
  description,
}: SimpleStatusBoxProps) {
  return (
    <section
      role="status"
      className={cn(
        "flex gap-3 rounded-md border-2 p-5 sm:p-6",
        TONE_CLASSES[tone],
      )}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="mt-1 text-sm">{description}</p>
      </div>
    </section>
  );
}
