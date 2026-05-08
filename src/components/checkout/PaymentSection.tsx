"use client";

import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { CheckoutFormData } from "@/lib/validations/checkout";

export function PaymentSection() {
  const form = useFormContext<CheckoutFormData>();

  return (
    <section className="space-y-4 rounded-md border bg-white p-5">
      <h2 className="text-base font-bold">결제 정보</h2>

      <div className="rounded-md border bg-muted/50 px-4 py-3">
        <label className="flex cursor-not-allowed items-center gap-2 text-sm font-medium">
          <input
            type="radio"
            name="payment_method"
            checked
            readOnly
            className="h-4 w-4 accent-primary"
          />
          무통장입금
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          현재 무통장입금만 지원합니다. PG 결제는 추후 추가될 예정입니다.
        </p>
      </div>

      <FormField
        control={form.control}
        name="depositor_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              입금자명 <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="홍길동" {...field} />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              받는 사람과 다를 수 있습니다. 실제 입금하실 분의 이름을
              입력해주세요.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
        <p className="font-semibold">입금 안내</p>
        <p className="mt-1 text-xs text-muted-foreground">
          주문 후 24시간 이내 입금 부탁드립니다. 입금 확인 후 제작이
          시작됩니다.
        </p>
      </div>
    </section>
  );
}
