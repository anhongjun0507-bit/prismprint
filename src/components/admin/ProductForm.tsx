"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/(protected)/products/actions";
import { productSchema, type ProductInput } from "@/lib/validations/product";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { ProductOptionsEditor } from "@/components/admin/ProductOptionsEditor";

import type { Category } from "@/types";

interface ProductFormProps {
  categories: Category[];
  defaultValues?: Partial<ProductInput>;
  // 있으면 수정, 없으면 신규.
  productId?: string;
}

const EMPTY_DEFAULTS: ProductInput = {
  category_id: "",
  slug: "",
  name: "",
  description: "",
  base_price: 0,
  thumbnail_url: "",
  images: [],
  options: [],
  is_active: true,
  display_order: 0,
};

export function ProductForm({
  categories,
  defaultValues,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isEdit = Boolean(productId);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  const isSubmitting = form.formState.isSubmitting;
  const watchedSlug = form.watch("slug");

  async function handleDelete() {
    if (!productId) return;
    if (!confirm("이 상품을 정말 삭제할까요? 복구할 수 없습니다.")) return;
    setDeleting(true);
    const res = await deleteProductAction(productId);
    setDeleting(false);
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setSubmitError(res.error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          setSubmitError(null);
          const res = isEdit && productId
            ? await updateProductAction(productId, values)
            : await createProductAction(values);
          if (res.ok) {
            router.push("/admin/products");
            router.refresh();
          } else {
            setSubmitError(res.error);
          }
        })}
        className="space-y-6"
      >
        <BasicInfoSection categories={categories} />
        <ImagesSection productSlug={watchedSlug || "product"} />
        <OptionsSection />

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || isSubmitting}
              className="mr-auto"
            >
              {deleting ? "삭제 중..." : "삭제"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : isEdit ? "수정" : "등록"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ─────────────────────────────────────────────
// 섹션 — 기본 정보
// ─────────────────────────────────────────────

function BasicInfoSection({ categories }: { categories: Category[] }) {
  const form = useFormContextStrict();
  return (
    <section className="space-y-4 rounded-md border bg-background p-5">
      <h2 className="text-base font-bold">기본 정보</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>슬러그 (URL)</FormLabel>
              <FormControl>
                <Input placeholder="my-product" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>상품명</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>설명 (선택)</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="base_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>기본 가격 (원)</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="display_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>정렬 순서</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-end gap-2">
              <FormLabel>활성</FormLabel>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                사용자에게 노출
              </label>
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 섹션 — 이미지
// ─────────────────────────────────────────────

function ImagesSection({ productSlug }: { productSlug: string }) {
  const form = useFormContextStrict();
  return (
    <section className="space-y-4 rounded-md border bg-background p-5">
      <h2 className="text-base font-bold">썸네일</h2>
      <FormField
        control={form.control}
        name="thumbnail_url"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ProductImageUploader
                value={field.value || null}
                onChange={(url) => field.onChange(url ?? "")}
                productSlug={productSlug}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

// ─────────────────────────────────────────────
// 섹션 — 옵션
// ─────────────────────────────────────────────

function OptionsSection() {
  const form = useFormContextStrict();
  return (
    <section className="space-y-4 rounded-md border bg-background p-5">
      <h2 className="text-base font-bold">옵션</h2>
      <FormField
        control={form.control}
        name="options"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ProductOptionsEditor
                value={field.value ?? []}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

// ─────────────────────────────────────────────
// 헬퍼 — RHF context (sub-section 들이 같은 form 을 공유)
// ─────────────────────────────────────────────
import { useFormContext } from "react-hook-form";

function useFormContextStrict() {
  const ctx = useFormContext<ProductInput>();
  return ctx;
}
