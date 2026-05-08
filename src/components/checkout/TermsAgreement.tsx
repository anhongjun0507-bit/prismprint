"use client";

import Link from "next/link";
import { useFormContext } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import type { CheckoutFormData } from "@/lib/validations/checkout";

export function TermsAgreement() {
  const form = useFormContext<CheckoutFormData>();

  return (
    <section className="space-y-3 rounded-md border bg-white p-5">
      <h2 className="text-base font-bold">약관 동의</h2>
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="agreed_terms"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
                />
                <span className="leading-tight">
                  <span className="text-destructive">[필수]</span>{" "}
                  이용약관에 동의합니다.{" "}
                  <Link
                    href="/terms"
                    className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    보기
                  </Link>
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreed_privacy"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
                />
                <span className="leading-tight">
                  <span className="text-destructive">[필수]</span>{" "}
                  개인정보처리방침에 동의합니다.{" "}
                  <Link
                    href="/privacy"
                    className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    보기
                  </Link>
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
