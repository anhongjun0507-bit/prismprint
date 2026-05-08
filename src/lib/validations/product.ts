import { z } from "zod";

export const productOptionValueSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "옵션 값 라벨을 입력해주세요")
    .max(50, "옵션 값은 50자 이하"),
  price_delta: z.coerce
    .number()
    .int("가산 금액은 정수여야 합니다"),
});

export const productOptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "옵션 그룹명을 입력해주세요")
    .max(50, "옵션 그룹명은 50자 이하"),
  values: z
    .array(productOptionValueSchema)
    .min(1, "옵션 값을 최소 1개 이상 추가해주세요"),
  is_required: z.boolean().default(true),
  display_order: z.coerce.number().int().default(0),
});

export const productImageSchema = z.object({
  url: z.string().url("올바른 URL 이 아닙니다"),
  alt: z.string().max(200, "alt 는 200자 이하").optional(),
  display_order: z.coerce.number().int().default(0),
});

export const productSchema = z.object({
  category_id: z.string().uuid("카테고리를 선택해주세요"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "영문 소문자·숫자·하이픈만 사용할 수 있습니다")
    .min(2, "슬러그는 2자 이상")
    .max(50, "슬러그는 50자 이하"),
  name: z
    .string()
    .trim()
    .min(1, "상품명을 입력해주세요")
    .max(100, "상품명은 100자 이하"),
  description: z
    .string()
    .trim()
    .max(5000, "설명은 5000자 이하")
    .optional()
    .or(z.literal("")),
  base_price: z.coerce
    .number()
    .int("가격은 정수여야 합니다")
    .min(0, "가격은 0원 이상"),
  thumbnail_url: z
    .string()
    .url("올바른 이미지 URL 이 아닙니다")
    .optional()
    .or(z.literal("")),
  images: z.array(productImageSchema).default([]),
  options: z.array(productOptionSchema).default([]),
  is_active: z.boolean().default(true),
  display_order: z.coerce.number().int().default(0),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductOptionInput = z.infer<typeof productOptionSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
