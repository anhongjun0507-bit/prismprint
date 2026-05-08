import Link from "next/link";

import { findOrderForLookup } from "@/lib/supabase/queries/orders";
import { siteConfig } from "@/lib/site-config";
import { formatPrice } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { DbOrderStatusBox } from "@/components/order/DbOrderStatusBox";
import { OrderLookupForm } from "@/components/order/OrderLookupForm";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";

import type { OrderItemRow, OrderRow } from "@/lib/supabase/queries/orders";
import type { OrderStatus } from "@/types";

interface OrderLookupPageProps {
  searchParams: Promise<{ orderNumber?: string; phone?: string }>;
}

export default async function OrderLookupPage({
  searchParams,
}: OrderLookupPageProps) {
  const sp = await searchParams;
  const orderNumber = (sp.orderNumber ?? "").trim();
  const phone = (sp.phone ?? "").trim();

  // 두 값이 모두 있으면 즉시 조회 시도.
  if (orderNumber && phone) {
    const result = await findOrderForLookup(orderNumber, phone);
    if (result) {
      return <FoundView order={result.order} items={result.items} />;
    }
    return <NotFoundView orderNumber={orderNumber} phone={phone} />;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <header className="text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">주문 조회</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          주문번호와 주문 시 입력하신 휴대폰 뒤 4자리를 입력해주세요.
        </p>
      </header>
      <OrderLookupForm
        defaultOrderNumber={orderNumber}
        defaultPhone={phone}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// 결과 — 발견
// ─────────────────────────────────────────────

interface FoundViewProps {
  order: OrderRow;
  items: OrderItemRow[];
}

function FoundView({ order, items }: FoundViewProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">주문번호</p>
          <p className="font-mono text-base font-bold sm:text-lg">
            {order.order_number}
          </p>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="mt-6 space-y-5">
        <DbOrderStatusBox order={order} />
        <ItemsSection items={items} />
        <PaymentSummarySection order={order} />
        <RecipientSection order={order} />
        <ContactSection />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto sm:min-w-[180px]"
        >
          <Link href="/order/lookup">다시 검색</Link>
        </Button>
        <Button asChild className="w-full sm:w-auto sm:min-w-[180px]">
          <Link href="/">메인으로</Link>
        </Button>
      </div>
    </div>
  );
}

function ItemsSection({ items }: { items: OrderItemRow[] }) {
  return (
    <section className="rounded-md border bg-white p-5">
      <h2 className="text-base font-bold">
        주문 상품 <span className="text-muted-foreground">({items.length})</span>
      </h2>
      <ul className="mt-3 divide-y">
        {items.map((item) => {
          const opts =
            (item.selected_options as Record<string, string> | null) ?? {};
          const summary = Object.values(opts).join(" · ");
          return (
            <li key={item.id} className="space-y-1 py-3 text-sm">
              <Link
                href={`/products/${item.product_slug}`}
                className="font-medium hover:underline"
              >
                {item.product_name}
              </Link>
              {summary && (
                <p className="text-xs text-muted-foreground">{summary}</p>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  수량 {item.quantity}
                </span>
                <span className="font-semibold text-foreground">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PaymentSummarySection({ order }: { order: OrderRow }) {
  const productTotal = order.total_amount - order.shipping_fee;
  return (
    <section className="rounded-md border bg-white p-5">
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

function RecipientSection({ order }: { order: OrderRow }) {
  return (
    <section className="rounded-md border bg-white p-5">
      <h2 className="text-base font-bold">받는 사람·배송지</h2>
      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[100px_1fr]">
        <dt className="text-muted-foreground">성명</dt>
        <dd>{order.recipient_name}</dd>

        <dt className="text-muted-foreground">휴대폰</dt>
        <dd className="font-mono">{order.recipient_phone}</dd>

        <dt className="text-muted-foreground">주소</dt>
        <dd className="space-y-0.5">
          <p>
            ({order.shipping_zipcode}) {order.shipping_address}
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

function ContactSection() {
  return (
    <section className="rounded-md border bg-muted/30 p-5">
      <h2 className="text-base font-bold">문의</h2>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex gap-3">
          <dt className="w-20 shrink-0 text-muted-foreground">고객센터</dt>
          <dd className="font-mono">{siteConfig.customerService.phone}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-20 shrink-0 text-muted-foreground">이메일</dt>
          <dd>{siteConfig.customerService.email}</dd>
        </div>
      </dl>
    </section>
  );
}

// ─────────────────────────────────────────────
// 결과 — 못 찾음
// ─────────────────────────────────────────────

interface NotFoundViewProps {
  orderNumber: string;
  phone: string;
}

function NotFoundView({ orderNumber, phone }: NotFoundViewProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="rounded-md border bg-muted/30 p-6 text-center">
        <h1 className="text-xl font-bold sm:text-2xl">
          주문 정보를 찾을 수 없습니다
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          입력하신 주문번호와 휴대폰 뒤 4자리가 일치하는 주문이 없습니다.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          정보를 다시 확인하고 시도해주세요.
        </p>
      </div>
      <OrderLookupForm
        defaultOrderNumber={orderNumber}
        defaultPhone={phone}
      />
    </div>
  );
}
