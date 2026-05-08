"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// ─────────────────────────────────────────
// Q&A 답변 수정·삭제
// ─────────────────────────────────────────

export async function updateQnaReplyAction(
  replyId: string,
  content: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const trimmed = content.trim();
  if (trimmed.length < 2 || trimmed.length > 2000) {
    return { ok: false, error: "답변은 2~2000자 사이로 입력해주세요." };
  }

  const { data: reply } = await supabase
    .from("qna_replies")
    .select("post_id")
    .eq("id", replyId)
    .maybeSingle();
  if (!reply) return { ok: false, error: "답변을 찾을 수 없습니다." };

  const { error } = await supabase
    .from("qna_replies")
    .update({ content: trimmed })
    .eq("id", replyId);
  if (error) {
    console.error("updateQnaReply:", error);
    return { ok: false, error: "답변 수정에 실패했습니다." };
  }

  revalidatePath("/admin/board");
  revalidatePath(`/admin/board/qna/${reply.post_id}`);
  revalidatePath(`/qna/${reply.post_id}`);
  return { ok: true };
}

export async function deleteQnaReplyAction(
  replyId: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const { data: reply } = await supabase
    .from("qna_replies")
    .select("post_id")
    .eq("id", replyId)
    .maybeSingle();
  if (!reply) return { ok: false, error: "답변을 찾을 수 없습니다." };
  const postId = reply.post_id;

  const { error } = await supabase
    .from("qna_replies")
    .delete()
    .eq("id", replyId);
  if (error) {
    console.error("deleteQnaReply:", error);
    return { ok: false, error: "답변 삭제에 실패했습니다." };
  }

  // 마지막 답변이 삭제됐다면 is_answered=false 로 되돌림.
  const { count } = await supabase
    .from("qna_replies")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);
  if ((count ?? 0) === 0) {
    await supabase
      .from("qna_posts")
      .update({ is_answered: false })
      .eq("id", postId);
  }

  revalidatePath("/admin/board");
  revalidatePath(`/admin/board/qna/${postId}`);
  revalidatePath("/qna");
  revalidatePath(`/qna/${postId}`);
  return { ok: true };
}

// ─────────────────────────────────────────
// 후기 노출 토글
// ─────────────────────────────────────────

export async function toggleReviewVisibilityAction(
  reviewId: string,
  isVisible: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  // 무효화 대상 product slug 보존
  const { data: review } = await supabase
    .from("reviews")
    .select("product:products(slug)")
    .eq("id", reviewId)
    .maybeSingle();
  const productSlug = (review?.product as { slug: string } | null | undefined)
    ?.slug;

  const { error } = await supabase
    .from("reviews")
    .update({ is_visible: isVisible })
    .eq("id", reviewId);
  if (error) {
    console.error("toggleReviewVisibility:", error);
    return { ok: false, error: "노출 상태 변경에 실패했습니다." };
  }

  revalidatePath("/admin/board");
  if (productSlug) revalidatePath(`/products/${productSlug}`);
  return { ok: true };
}
