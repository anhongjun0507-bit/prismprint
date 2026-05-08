import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import { formatPrice } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { DepositInfoBox } from "@/components/order/DepositInfoBox";
import { OrderStepIndicator } from "@/components/order/OrderStepIndicator";
import { OrderNumberCopyBox } from "@/components/order/OrderNumberCopyBox";
import { CartCleanupOnMount } from "@/components/order/CartCleanupOnMount";

import type { Database } from "@/types/database";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

interface OrderCompletePageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function OrderCompletePage({
  searchParams,
}: OrderCompletePageProps) {
  const sp = await searchParams;
  const orderNumber = sp.orderNumber;
  if (!orderNumber || typeof orderNumber !== "string") {
    redirect("/cart");
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) {
    return <NotFoundView orderNumber={orderNumber} />;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .order("id");

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <CartCleanupOnMount />
      <OrderStepIndicator current={3} />

      <header className="mt-6 text-center md:mt-8">
        <CheckCircle2
          aria-hidden
          className="mx-auto h-14 w-14 text-primary md:h-16 md:w-16"
        />
        <h1 className="mt-3 text-xl font-bold sm:text-2xl">
          주문이 정상적으로 접수되었습니다
        </h1>
        <OrderNumberCopyBox orderNumber={order.order_number} />
      </header>

      <div className="mt-6 space-y-5">
        <DepositInfoBox
          bankName={siteConfig.bank.name}
          accountNumber={siteConfig.bank.accountNumber}
          holder={siteConfig.bank.holder}
          amount={order.total_amount}
          depositorName={order.depositor_name}
          createdAt={order.created_at}
        />

        <ItemsSection items={items ?? []} />
        <PaymentSummarySection order={order} />
        <RecipientSection order={order} />
        <NextStepsSection />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto sm:min-w-[180px]"
        >
          <Link
            href={`/order/lookup?orderNumber=${encodeURIComponent(order.order_number)}&phone=${order.phone_last4}`}
          >
            주문 조회하기
          </Link>
        </Button>
        <Button asChild className="w-full sm:w-auto sm:min-w-[180px]">
          <Link href="/">메인으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────

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
              <p className="font-medium">{item.product_name}</p>
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

function NextStepsSection() {
  return (
    <section className="rounded-md border bg-muted/30 p-5">
      <h2 className="text-base font-bold">다음 단계 안내</h2>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <li>• 입금 확인 후 제작이 시작됩니다.</li>
        <li>• 입금 확인은 평일 영업시간 내 처리됩니다.</li>
        <li>• 문의는 아래 고객센터로 연락 주세요.</li>
      </ul>
      <dl className="mt-4 space-y-1.5 text-sm">
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

interface NotFoundViewProps {
  orderNumber: string;
}

function NotFoundView({ orderNumber }: NotFoundViewProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="rounded-md border bg-muted/30 p-8 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">
          주문 정보를 찾을 수 없습니다
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          주문번호 <span className="font-mono">{orderNumber}</span> 에 해당하는
          주문이 없습니다.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/order/lookup">주문 조회</Link>
          </Button>
          <Button asChild>
            <Link href="/">메인으로</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
