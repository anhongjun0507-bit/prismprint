import { createClient } from "@/lib/supabase/server";
import { maskAuthorName } from "@/lib/qna-format";

import type { ReviewPublic } from "@/types";

export const REVIEWS_PER_PAGE = 10;

export interface ReviewListResult {
  reviews: ReviewPublic[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getReviewsByProductId(
  productId: string,
  page = 1,
): Promise<ReviewListResult> {
  const supabase = await createClient();
  const from = (page - 1) * REVIEWS_PER_PAGE;
  const to = from + REVIEWS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("reviews")
    .select(
      "id, product_id, author_name, rating, title, content, is_visible, created_at",
      { count: "exact" },
    )
    .eq("product_id", productId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to fetch reviews:", error);
    return { reviews: [], total: 0, page, totalPages: 1 };
  }

  // author_name 은 서버에서 미리 마스킹 — RSC 직렬화 페이로드에도 raw 값 차단.
  const reviews: ReviewPublic[] = (data ?? []).map((r) => ({
    ...r,
    author_name: maskAuthorName(r.author_name),
  })) as ReviewPublic[];

  const total = count ?? 0;
  return {
    reviews,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE)),
  };
}

export async function getReviewCountByProductId(
  productId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("is_visible", true);

  if (error) {
    console.error("Failed to count reviews:", error);
    return 0;
  }
  return count ?? 0;
}

export async function getAverageRating(
  productId: string,
): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_visible", true);

  if (error || !data || data.length === 0) return null;

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return sum / data.length;
}
