"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  orderLookupSchema,
  type OrderLookupFormData,
} from "@/lib/validations/order-lookup";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface OrderLookupFormProps {
  defaultOrderNumber?: string;
  defaultPhone?: string;
}

export function OrderLookupForm({
  defaultOrderNumber = "",
  defaultPhone = "",
}: OrderLookupFormProps) {
  const router = useRouter();

  const form = useForm<OrderLookupFormData>({
    resolver: zodResolver(orderLookupSchema),
    mode: "onChange",
    defaultValues: {
      order_number: defaultOrderNumber,
      phone_last4: defaultPhone,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          const params = new URLSearchParams({
            orderNumber: data.order_number,
            phone: data.phone_last4,
          });
          router.push(`/order/lookup?${params.toString()}`);
        })}
        className="mt-8 space-y-4"
      >
        <FormField
          control={form.control}
          name="order_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>주문번호</FormLabel>
              <FormControl>
                <Input
                  placeholder="ORD-20260508-0001"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_last4"
          render={({ field }) => (
            <FormItem>
              <FormLabel>휴대폰 뒤 4자리</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1234"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!form.formState.isValid}
        >
          조회하기
        </Button>
      </form>
    </Form>
  );
}
