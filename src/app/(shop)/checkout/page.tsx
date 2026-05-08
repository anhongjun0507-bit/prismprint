"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { AddressForm } from "@/components/checkout/AddressForm";
import { PaymentSection } from "@/components/checkout/PaymentSection";
import { RecipientForm } from "@/components/checkout/RecipientForm";
import { TermsAgreement } from "@/components/checkout/TermsAgreement";
import { OrderStepIndicator } from "@/components/order/OrderStepIndicator";

import { useHasMounted } from "@/hooks/useHasMounted";
import { getCategoryGradient } from "@/lib/categoryStyles";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import {
  checkoutSchema,
  type CheckoutFormData,
} from "@/lib/validations/checkout";
import { createOrderAction } from "@/app/(shop)/checkout/actions";

import type { CartItem } from "@/types";

const SHIPPING_FEE = 3000;

export default function CheckoutPage() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const items = useCartStore((s) => s.items);
  const productTotal = useCartStore((s) => s.getTotalAmount());
  const clearCart = useCartStore((s) => s.clearCart);

  const [submitError, setSubmitError] = useState<string | null>(null);

  // 제출 중에는 빈 카트 redirect를 막아야 한다.
  // (clearCart() 직후 useEffect가 /cart로 보내려 하면 /order/complete 이동과 경합)
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!hasMounted) return;
    if (submittingRef.current) return;
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [hasMounted, items.length, router]);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      recipient_name: "",
      recipient_phone: "",
      recipient_email: "",
      shipping_zipcode: "",
      shipping_address: "",
      shipping_address_detail: "",
      shipping_memo: "",
      depositor_name: "",
      agreed_terms: false,
      agreed_privacy: false,
    },
  });

  async function onSubmit(data: CheckoutFormData) {
    submittingRef.current = true;
    setSubmitError(null);

    const res = await createOrderAction({
      recipient_name: data.recipient_name,
      recipient_phone: data.recipient_phone,
      recipient_email: data.recipient_email || "",
      shipping_zipcode: data.shipping_zipcode,
      shipping_address: data.shipping_address,
      shipping_address_detail: data.shipping_address_detail || null,
      shipping_memo: data.shipping_memo || null,
      depositor_name: data.depositor_name,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        selected_options: item.selected_options,
        custom_data: item.custom_data,
      })),
    });

    if (!res.ok) {
      submittingRef.current = false;
      setSubmitError(res.error);
      toast.error(res.error);
      return;
    }

    clearCart();
    router.push(
      `/order/complete?orderNumber=${encodeURIComponent(res.orderNumber)}`,
    );
  }

  if (!hasMounted || items.length === 0) {
    return <CheckoutSkeleton />;
  }

  const finalTotal = productTotal + SHIPPING_FEE;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <OrderStepIndicator current={2} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-10"
        >
          <div className="space-y-4">
            <OrderSummary items={items} />
            <RecipientForm />
            <AddressForm />
            <PaymentSection />
            <TermsAgreement />
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-md border bg-muted/30 p-5">
              <h2 className="text-base font-semibold">결제 금액</h2>
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
                type="submit"
                size="lg"
                disabled={!form.formState.isValid || form.formState.isSubmitting}
                className="mt-5 w-full"
              >
                {form.formState.isSubmitting ? "주문 처리 중..." : "주문하기"}
              </Button>
              {submitError && (
                <p className="mt-3 text-xs text-destructive">{submitError}</p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                결제는 무통장입금으로만 진행됩니다.
              </p>
            </div>
          </aside>
        </form>
      </Form>
    </div>
  );
}

// ------------------------------------------------
// 헬퍼 컴포넌트
// ------------------------------------------------

interface OrderSummaryProps {
  items: CartItem[];
}

function OrderSummary({ items }: OrderSummaryProps) {
  return (
    <section className="space-y-3 rounded-md border bg-white p-5">
      <h2 className="text-base font-bold">
        주문 상품{" "}
        <span className="text-muted-foreground">({items.length})</span>
      </h2>
      <ul className="space-y-3">
        {items.map((item) => {
          const optionsSummary = Object.values(item.selected_options).join(
            " · ",
          );
          return (
            <li key={item.id} className="flex gap-3">
              <div
                className={cn(
                  "relative aspect-square w-16 shrink-0 overflow-hidden rounded-md bg-gradient-to-br",
                  getCategoryGradient(item.category_id),
                )}
              >
                {item.thumbnail_url && (
                  <Image
                    src={item.thumbnail_url}
                    alt={item.product_name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {item.product_name}
                  </p>
                  {optionsSummary && (
                    <p className="text-xs text-muted-foreground">
                      {optionsSummary}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    수량 {item.quantity}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <div className="h-6 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}

