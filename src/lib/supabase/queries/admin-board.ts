import { createClient } from "@/lib/supabase/server";

import type { Database } from "@/types/database";

type QnaPostRow = Database["public"]["Tables"]["qna_posts"]["Row"];
type QnaReplyRow = Database["public"]["Tables"]["qna_replies"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

// password_hash 는 admin 도 클라이언트로 받을 필요 없음 → select 단계에서 제외.
export type AdminQnaPost = Omit<QnaPostRow, "password_hash">;
export type AdminQnaReply = QnaReplyRow;
export type AdminReview = Omit<ReviewRow, "password_hash"> & {
  product: { id: string; name: string; slug: string } | null;
};

export const ADMIN_BOARD_PER_PAGE = 20;

const QNA_SELECT =
  "id, author_name, title, content, is_secret, is_answered, created_at, updated_at";
const REVIEW_SELECT =
  "id, product_id, author_name, rating, title, content, is_visible, created_at, product:products(id, name, slug)";

// ─────────────────────────────────────────
// Q&A
// ─────────────────────────────────────────

export interface AdminQnaFilters {
  isAnswered?: "all" | "true" | "false";
  searchQuery?: string;
  page?: number;
}

export interface AdminQnaResult {
  posts: AdminQnaPost[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAdminQnaPosts(
  filters: AdminQnaFilters = {},
): Promise<AdminQnaResult> {
  const supabase = await createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const from = (page - 1) * ADMIN_BOARD_PER_PAGE;
  const to = from + ADMIN_BOARD_PER_PAGE - 1;

  let query = supabase
    .from("qna_posts")
    .select(QNA_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.isAnswered === "true") query = query.eq("is_answered", true);
  else if (filters.isAnswered === "false")
    query = query.eq("is_answered", false);

  if (filters.searchQuery) {
    const q = filters.searchQuery.trim();
    if (q) query = query.or(`title.ilike.%${q}%,author_name.ilike.%${q}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("getAdminQnaPosts:", error);
    return { posts: [], total: 0, page, totalPages: 1 };
  }
  return {
    posts: (data ?? []) as AdminQnaPost[],
    total: count ?? 0,
    page,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / ADMIN_BOARD_PER_PAGE)),
  };
}

export interface AdminQnaDetail {
  post: AdminQnaPost;
  replies: AdminQnaReply[];
}

export async function getAdminQnaPostDetail(
  id: string,
): Promise<AdminQnaDetail | null> {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("qna_posts")
    .select(QNA_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!post) return null;

  const { data: replies } = await supabase
    .from("qna_replies")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  return {
    post: post as AdminQnaPost,
    replies: (replies ?? []) as AdminQnaReply[],
  };
}

// ─────────────────────────────────────────
// Reviews
// ─────────────────────────────────────────

export interface AdminReviewFilters {
  productId?: string | "all";
  isVisible?: "all" | "true" | "false";
  ratingMin?: number;
  page?: number;
}

export interface AdminReviewResult {
  reviews: AdminReview[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAdminReviews(
  filters: AdminReviewFilters = {},
): Promise<AdminReviewResult> {
  const supabase = await createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const from = (page - 1) * ADMIN_BOARD_PER_PAGE;
  const to = from + ADMIN_BOARD_PER_PAGE - 1;

  let query = supabase
    .from("reviews")
    .select(REVIEW_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.productId && filters.productId !== "all") {
    query = query.eq("product_id", filters.productId);
  }
  if (filters.isVisible === "true") query = query.eq("is_visible", true);
  else if (filters.isVisible === "false") query = query.eq("is_visible", false);
  if (filters.ratingMin && filters.ratingMin > 1) {
    query = query.gte("rating", filters.ratingMin);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("getAdminReviews:", error);
    return { reviews: [], total: 0, page, totalPages: 1 };
  }
  return {
    reviews: (data ?? []) as unknown as AdminReview[],
    total: count ?? 0,
    page,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / ADMIN_BOARD_PER_PAGE)),
  };
}

// ─────────────────────────────────────────
// Stats
// ─────────────────────────────────────────

export interface BoardStats {
  unanswered_qna: number;
  total_qna: number;
  hidden_reviews: number;
  total_reviews: number;
}

export async function getBoardStats(): Promise<BoardStats> {
  const supabase = await createClient();
  const [unansweredQna, totalQna, hiddenReviews, totalReviews] =
    await Promise.all([
      supabase
        .from("qna_posts")
        .select("id", { count: "exact", head: true })
        .eq("is_answered", false),
      supabase.from("qna_posts").select("id", { count: "exact", head: true }),
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("is_visible", false),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
    ]);
  return {
    unanswered_qna: unansweredQna.count ?? 0,
    total_qna: totalQna.count ?? 0,
    hidden_reviews: hiddenReviews.count ?? 0,
    total_reviews: totalReviews.count ?? 0,
  };
}
