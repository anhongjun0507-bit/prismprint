"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import {
  createQnaSchema,
  createReplySchema,
  verifyPasswordSchema,
  type CreateQnaInput,
  type CreateReplyInput,
} from "@/lib/validations/qna";

import type { QnaReply } from "@/types";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : T))
  | { ok: false; error: string };

// ─────────────────────────────────────────
// 글 작성 (anon INSERT)
// ─────────────────────────────────────────
export async function createQnaAction(
  input: CreateQnaInput,
): Promise<ActionResult<{ id: string }>> {
  const validated = createQnaSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, error: validated.error.errors[0].message };
  }

  const { author_name, password, title, content, is_secret } = validated.data;
  const password_hash = await hashPassword(password);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qna_posts")
    .insert({
      author_name,
      password_hash,
      title,
      content,
      is_secret,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create qna post:", error);
    return { ok: false, error: "글을 등록하지 못했습니다." };
  }

  revalidatePath("/qna");
  return { ok: true, id: data.id };
}

// ─────────────────────────────────────────
// 비밀글 잠금 해제 — 비밀번호 검증 후 본문·답변 반환
// ─────────────────────────────────────────
export async function verifyAndRevealAction(
  postId: string,
  password: string,
): Promise<ActionResult<{ content: string; replies: QnaReply[] }>> {
  const validated = verifyPasswordSchema.safeParse({ password });
  if (!validated.success) {
    return { ok: false, error: validated.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("qna_posts")
    .select("password_hash, content")
    .eq("id", postId)
    .maybeSingle();

  if (!post) return { ok: false, error: "글을 찾을 수 없습니다." };

  const passOk = await verifyPassword(password, post.password_hash);
  if (!passOk) return { ok: false, error: "비밀번호가 일치하지 않습니다." };

  const { data: replies } = await supabase
    .from("qna_replies")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  return {
    ok: true,
    content: post.content,
    replies: (replies ?? []) as QnaReply[],
  };
}

// ─────────────────────────────────────────
// 글 삭제 — admin 은 즉시 / anon 은 비밀번호 검증 후 service role 로 우회 삭제
// ─────────────────────────────────────────
export async function deleteQnaPostAction(
  postId: string,
  password: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // 관리자 — RLS 가 authenticated 에 DELETE 허용
    const { error } = await supabase
      .from("qna_posts")
      .delete()
      .eq("id", postId);
    if (error) {
      console.error("Admin delete failed:", error);
      return { ok: false, error: "삭제에 실패했습니다." };
    }
    revalidatePath("/qna");
    return { ok: true };
  }

  // 비회원 — 비밀번호 검증 후 service-role 로 RLS 우회
  if (!password) {
    return { ok: false, error: "비밀번호를 입력해주세요." };
  }
  const validated = verifyPasswordSchema.safeParse({ password });
  if (!validated.success) {
    return { ok: false, error: validated.error.errors[0].message };
  }

  const { data: post } = await supabase
    .from("qna_posts")
    .select("password_hash")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return { ok: false, error: "글을 찾을 수 없습니다." };

  const passOk = await verifyPassword(password, post.password_hash);
  if (!passOk) return { ok: false, error: "비밀번호가 일치하지 않습니다." };

  const admin = createAdminClient();
  const { error } = await admin.from("qna_posts").delete().eq("id", postId);
  if (error) {
    console.error("Self delete failed:", error);
    return { ok: false, error: "삭제에 실패했습니다." };
  }

  revalidatePath("/qna");
  return { ok: true };
}

// ─────────────────────────────────────────
// 관리자 답변 작성 (authenticated 만)
// ─────────────────────────────────────────
export async function createReplyAction(
  postId: string,
  input: CreateReplyInput,
): Promise<ActionResult> {
  const validated = createReplySchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, error: validated.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const { error } = await supabase.from("qna_replies").insert({
    post_id: postId,
    author_id: user.id,
    content: validated.data.content,
  });
  if (error) {
    console.error("Failed to create reply:", error);
    return { ok: false, error: "답변을 등록하지 못했습니다." };
  }

  // 답변이 달렸음을 표시
  await supabase
    .from("qna_posts")
    .update({ is_answered: true })
    .eq("id", postId);

  revalidatePath(`/qna/${postId}`);
  revalidatePath("/qna");
  return { ok: true };
}
