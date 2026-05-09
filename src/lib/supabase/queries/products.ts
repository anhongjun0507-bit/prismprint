import { createClient } from "@/lib/supabase/server";

import type { ProductWithCategory } from "@/types";

const PRODUCT_WITH_CATEGORY_SELECT =
  "*, category:categories(id, name, slug)";

export async function getProductsByCategoryId(
  categoryId: string,
): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_CATEGORY_SELECT)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("display_order");

  if (error) {
    console.error("Failed to fetch products by category:", error);
    return [];
  }

  // images / options 는 jsonb. 자동 생성 타입은 Json 으로 추론되지만
  // 저장 형태를 ProductImage[] / ProductOption[] 로 통제하므로 도메인 타입으로 변환.
  return (data ?? []) as unknown as ProductWithCategory[];
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_CATEGORY_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch product by slug:", error);
    return null;
  }
  return data as unknown as ProductWithCategory | null;
}

// Phase 2 에서 created_at·order_count 등 실제 컬럼 기준으로 교체 예정.
// 현재는 display_order 오름차순으로 "신상품" 큐레이션을 흉내낸다.
export async function getNewProducts(
  limit = 8,
): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_CATEGORY_SELECT)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch new products:", error);
    return [];
  }
  return (data ?? []) as unknown as ProductWithCategory[];
}

// "베스트" 큐레이션도 임시. display_order 내림차순으로 신상품과 다른 상품을 노출.
export async function getBestProducts(
  limit = 8,
): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_CATEGORY_SELECT)
    .eq("is_active", true)
    .order("display_order", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch best products:", error);
    return [];
  }
  return (data ?? []) as unknown as ProductWithCategory[];
}

// 상품명 기준 부분 일치 검색. ILIKE 메타문자(%, _, \)는 이스케이프해 안전하게 매칭.
export async function searchProducts(
  query: string,
): Promise<ProductWithCategory[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const escaped = trimmed.replace(/[\\%_]/g, "\\$&");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_CATEGORY_SELECT)
    .eq("is_active", true)
    .ilike("name", `%${escaped}%`)
    .order("display_order");

  if (error) {
    console.error("Failed to search products:", error);
    return [];
  }
  return (data ?? []) as unknown as ProductWithCategory[];
}
