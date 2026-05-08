"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";

import { createReviewAction } from "@/app/(shop)/products/[slug]/actions";
import {
  createReviewSchema,
  type CreateReviewInput,
} from "@/lib/validations/review";
import { cn } from "@/lib/utils";

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
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  productId: string;
  productSlug: string;
}

export function ReviewForm({ productId, productSlug }: ReviewFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);

  const form = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      author_name: "",
      password: "",
      rating: 0,
      title: "",
      content: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          setSubmitError(null);
          setSubmitOk(false);
          const res = await createReviewAction({
            ...values,
            product_id: productId,
            product_slug: productSlug,
          });
          if (res.ok) {
            form.reset();
            setSubmitOk(true);
            router.refresh();
          } else {
            setSubmitError(res.error);
          }
        })}
        className="space-y-4 rounded-md border bg-muted/30 p-5 sm:p-6"
      >
        <h3 className="text-base font-bold md:text-lg">후기 작성</h3>

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>평점</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1" role="radiogroup">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={n === field.value}
                      aria-label={`${n}점`}
                      onClick={() => field.onChange(n)}
                      className="rounded p-1 transition-colors"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 transition-colors",
                          n <= field.value
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30 hover:text-amber-300",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="author_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>작성자명</FormLabel>
                <FormControl>
                  <Input placeholder="홍길동" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="off"
                    placeholder="삭제 시 사용 (4자 이상)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목 (선택)</FormLabel>
              <FormControl>
                <Input placeholder="후기 제목" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="상품을 사용하신 소감을 남겨주세요."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}
        {submitOk && (
          <p className="text-sm text-emerald-600">
            후기가 등록되었습니다. 감사합니다.
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "후기 등록"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
