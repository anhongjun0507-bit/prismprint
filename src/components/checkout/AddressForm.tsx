"use client";

import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { CheckoutFormData } from "@/lib/validations/checkout";

export function AddressForm() {
  const form = useFormContext<CheckoutFormData>();

  function handleSearchAddress() {
    // TODO(Phase 2): window.daum.Postcode SDK로 교체.
    toast.info("주소 검색은 추후 Daum 우편번호 API 연동 예정", {
      description:
        "임시 주소가 채워졌습니다. 상세주소만 입력해주세요.",
    });
    form.setValue("shipping_zipcode", "06000", {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue(
      "shipping_address",
      "서울특별시 강남구 테헤란로 123",
      { shouldValidate: true, shouldDirty: true },
    );
  }

  return (
    <section className="space-y-4 rounded-md border bg-white p-5">
      <h2 className="text-base font-bold">배송지</h2>
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="shipping_zipcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                우편번호 <span className="text-destructive">*</span>
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    readOnly
                    placeholder="우편번호"
                    autoComplete="postal-code"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearchAddress}
                  className="shrink-0"
                >
                  주소 검색
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shipping_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                기본 주소 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  readOnly
                  placeholder="주소 검색을 먼저 눌러주세요"
                  autoComplete="street-address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shipping_address_detail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상세 주소</FormLabel>
              <FormControl>
                <Input
                  placeholder="동·호수 등 상세 주소"
                  autoComplete="address-line2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shipping_memo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>배송 요청사항 (선택)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="문 앞에 두고 가주세요 등"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
