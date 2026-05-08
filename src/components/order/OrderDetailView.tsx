import { OrderItemRow } from "@/components/order/OrderItemRow";
import { OrderStatusBox } from "@/components/order/OrderStatusBox";

import { siteConfig } from "@/lib/site-config";
import { formatPrice } from "@/lib/utils";

import type { Order, OrderItem } from "@/types";

interface OrderDetailViewProps {
  order: Order;
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  return (
    <div className="space-y-5">
      <OrderStatusBox order={order} />
      <OrderItemsSection items={order.items} />
      <PaymentSummarySection order={order} />
      <RecipientSection order={order} />
      <NextStepsSection />
    </div>
  );
}

// ------------------------------------------------
// 섹션
// ------------------------------------------------

interface ItemsProps {
  items: OrderItem[];
}

function OrderItemsSection({ items }: ItemsProps) {
  return (
    <section className="rounded-md border bg-white p-5">
      <h2 className="text-base font-bold">
        주문 상품{" "}
        <span className="text-muted-foreground">({items.length})</span>
      </h2>
      <ul className="mt-3 divide-y">
        {items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

interface OrderProps {
  order: Order;
}

function PaymentSummarySection({ order }: OrderProps) {
  return (
    <section className="rounded-md border bg-white p-5">
      <h2 className="text-base font-bold">결제 정보</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">상품 합계</dt>
          <dd>{formatPrice(order.product_total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">배송비</dt>
          <dd>{formatPrice(order.shipping_fee)}</dd>
        </div>
        <div className="flex justify-between border-t pt-3 text-base font-bold">
          <dt>총 결제 금액</dt>
          <dd>{formatPrice(order.total_price)}</dd>
        </div>
      </dl>
    </section>
  );
}

function RecipientSection({ order }: OrderProps) {
  return (
    <section className="rounded-md border bg-white p-5">
      <h2 className="text-base font-bold">받는 사람·배송지</h2>
      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[100px_1fr]">
        <dt className="text-muted-foreground">성명</dt>
        <dd>{order.recipient_name}</dd>

        <dt className="text-muted-foreground">휴대폰</dt>
        <dd className="font-mono">{order.recipient_phone}</dd>

        {order.recipient_email && (
          <>
            <dt className="text-muted-foreground">이메일</dt>
            <dd>{order.recipient_email}</dd>
          </>
        )}

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
