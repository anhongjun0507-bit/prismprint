"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/shop/CartItemRow";

import { useHasMounted } from "@/hooks/useHasMounted";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice } from "@/lib/utils";

const SHIPPING_FEE = 3000;

export default function CartPage() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const items = useCartStore((s) => s.items);
  const productTotal = useCartStore((s) => s.getTotalAmount());

  if (!hasMounted) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  const finalTotal = productTotal + SHIPPING_FEE;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <h1 className="text-2xl font-bold md:text-3xl">
        장바구니{" "}
        <span className="text-muted-foreground">({items.length})</span>
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-10">
        <ul className="space-y-3">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </ul>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-md border bg-muted/30 p-5">
            <h2 className="text-base font-semibold">결제 정보</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">상품 합계</dt>
                <dd>{formatPrice(productTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">배송비</dt>
                <dd>{formatPrice(SHIPPING_FEE)}</dd>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-bold">
                <dt>총 결제 금액</dt>
                <dd>{formatPrice(finalTotal)}</dd>
              </div>
            </dl>
            <Button
              type="button"
              size="lg"
              className="mt-5 w-full"
              onClick={() => router.push("/checkout")}
            >
              주문하기
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              결제는 무통장입금으로만 진행됩니다.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4 py-16 text-center md:py-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">
          장바구니가 비었습니다
        </h1>
        <p className="text-muted-foreground">
          관심 있는 상품을 담아보세요.
        </p>
      </div>
      <Button asChild>
        <Link href="/">상품 둘러보기</Link>
      </Button>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
