import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getAdminOrderDetail } from "@/lib/supabase/queries/admin-orders";
import { formatQnaDate } from "@/lib/qna-format";
import { formatPrice } from "@/lib/utils";

import { OrderActionButtons } from "@/components/admin/OrderActionButtons";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";

import type {
  AdminDeposit,
  AdminOrder,
  AdminOrderItem,
} from "@/lib/supabase/queries/admin-orders";
import type { OrderStatus } from "@/types";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const detail = await getAdminOrderDetail(id);
  if (!detail) notFound();

  const { order, items, deposit } = detail;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        목록으로
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3 border-b pb-5">
        <div>
          <p className="text-xs text-muted-foreground">주문번호</p>
          <p className="font-mono text-base font-bold sm:text-lg">
            {order.order_number}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            주문일: {formatQnaDate(order.created_at)}
          </p>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </header>

      <div className="mt-6 space-y-6">
        <DepositSection order={order} deposit={deposit} />
        <OrderItemsSection items={items} />
        <PaymentSummarySection order={order} />
        <RecipientSection order={order} />
        <ShippingSection order={order} />
      </div>

      <footer className="mt-8 border-t pt-5">
        <h2 className="mb-3 text-base font-bold">상태 변경</h2>
        <OrderActionButtons
          orderId={order.id}
          status={order.status as OrderStatus}
          expectedAmount={order.total_amount}
          depositorName={order.depositor_name}
        />
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────

function DepositSection({
  order,
  deposit,
}: {
  order: AdminOrder;
  deposit: AdminDeposit | null;
}) {
  return (
    <section className="rounded-md border bg-background p-5">
      <h2 className="text-base font-bold">입금 정보</h2>
      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[140px_1fr]">
        <dt className="text-muted-foreground">입금자명</dt>
        <dd className="font-medium">{order.depositor_name}</dd>
        <dt className="text-muted-foreground">예상 금액</dt>
        <dd className="font-medium">{formatPrice(order.total_amount)}</dd>
        {deposit && (
          <>
            <dt className="text-muted-foreground">입금 확인</dt>
            <dd>
              {deposit.confirmed ? (
                <span className="text-emerald-700">
                  ✓ 확인됨
                  {deposit.confirmed_at &&
                    ` (${formatQnaDate(deposit.confirmed_at)})`}
                </span>
              ) : (
                <span className="text-amber-700">미확인</span>
              )}
            </dd>
            {deposit.memo && (
              <>
                <dt className="text-muted-foreground">메모</dt>
                <dd className="whitespace-pre-line">{deposit.memo}</dd>
              </>
            )}
          </>
        )}
      </dl>
    </section>
  );
}

function OrderItemsSection({ items }: { items: AdminOrderItem[] }) {
  return (
    <section className="rounded-md border bg-background p-5">
      <h2 className="text-base font-bold">
        주문 상품 <span className="text-muted-foreground">({items.length})</span>
      </h2>
      <ul className="mt-3 divide-y">
        {items.map((item) => (
          <li key={item.id} className="space-y-1 py-3 text-sm">
            <p className="font-medium">{item.product_name}</p>
            <p className="text-xs text-muted-foreground">
              수량 {item.quantity} · 단가 {formatPrice(item.unit_price)} · 합계{" "}
              <strong>{formatPrice(item.subtotal)}</strong>
            </p>
            {Array.isArray(item.selected_options) &&
              item.selected_options.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  옵션: {JSON.stringify(item.selected_options)}
                </p>
              )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PaymentSummarySection({ order }: { order: AdminOrder }) {
  const productTotal = order.total_amount - order.shipping_fee;
  return (
    <section className="rounded-md border bg-background p-5">
      <h2 className="text-base font-bold">결제 정보</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">상품 합계</dt>
          <dd>{formatPrice(productTotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">배송비</dt>
          <dd>{formatPrice(order.shipping_fee)}</dd>
        </div>
        <div className="flex justify-between border-t pt-3 text-base font-bold">
          <dt>총 결제 금액</dt>
          <dd>{formatPrice(order.total_amount)}</dd>
        </div>
      </dl>
    </section>
  );
}

function RecipientSection({ order }: { order: AdminOrder }) {
  return (
    <section className="rounded-md border bg-background p-5">
      <h2 className="text-base font-bold">받는 사람·배송지</h2>
      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[100px_1fr]">
        <dt className="text-muted-foreground">성명</dt>
        <dd>{order.recipient_name}</dd>
        <dt className="text-muted-foreground">휴대폰</dt>
        <dd className="font-mono">{order.recipient_phone}</dd>
        <dt className="text-muted-foreground">주소</dt>
        <dd className="space-y-0.5">
          <p>
            {order.shipping_zipcode && `(${order.shipping_zipcode}) `}
            {order.shipping_address}
          </p>
          {order.shipping_address_detail && (
            <p>{order.shipping_address_detail}</p>
          )}
        </dd>
        {order.shipping_memo && (
          <>
            <dt className="text-muted-foreground">요청사항</dt>
            <dd className="whitespace-pre-line">{order.shipping_memo}</dd>
          </>
        )}
      </dl>
    </section>
  );
}

function ShippingSection({ order }: { order: AdminOrder }) {
  if (!order.tracking_number && !order.shipped_at && !order.delivered_at) {
    return null;
  }
  return (
    <section className="rounded-md border bg-background p-5">
      <h2 className="text-base font-bold">배송 정보</h2>
      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[120px_1fr]">
        {order.tracking_number && (
          <>
            <dt className="text-muted-foreground">송장번호</dt>
            <dd className="font-mono">{order.tracking_number}</dd>
          </>
        )}
        {order.shipped_at && (
          <>
            <dt className="text-muted-foreground">출고일시</dt>
            <dd>{formatQnaDate(order.shipped_at)}</dd>
          </>
        )}
        {order.delivered_at && (
          <>
            <dt className="text-muted-foreground">완료일시</dt>
            <dd>{formatQnaDate(order.delivered_at)}</dd>
          </>
        )}
      </dl>
    </section>
  );
}
