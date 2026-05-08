"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import {
  createReviewSchema,
  verifyReviewPasswordSchema,
  type CreateReviewInput,
} from "@/lib/validations/review";

type ActionResult = { ok: true } | { ok: false; error: string };

interface CreateReviewParams extends CreateReviewInput {
  product_id: string;
  product_slug: string;
}

// ─────────────────────────────────────────
// 후기 작성 (anon INSERT)
// ─────────────────────────────────────────
export async function createReviewAction(
  input: CreateReviewParams,
): Promise<ActionResult> {
  const validated = createReviewSchema.safeParse({
    author_name: input.author_name,
    password: input.password,
    rating: input.rating,
    title: input.title,
    content: input.content,
  });
  if (!validated.success) {
    return { ok: false, error: validated.error.errors[0].message };
  }

  const password_hash = await hashPassword(validated.data.password);
  const titleNormalized =
    validated.data.title && validated.data.title.length > 0
      ? validated.data.title
      : null;

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    product_id: input.product_id,
    author_name: validated.data.author_name,
    password_hash,
    rating: validated.data.rating,
    title: titleNormalized,
    content: validated.data.content,
  });

  if (error) {
    console.error("Failed to create review:", error);
    return { ok: false, error: "후기를 등록하지 못했습니다." };
  }

  revalidatePath(`/products/${input.product_slug}`);
  return { ok: true };
}

// ─────────────────────────────────────────
// 후기 삭제 — admin 즉시, anon 비밀번호 검증 후 service-role 로 우회
// ─────────────────────────────────────────
export async function deleteReviewAction(
  reviewId: string,
  password: string | null,
  productSlug: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);
    if (error) {
      console.error("Admin delete review failed:", error);
      return { ok: false, error: "삭제에 실패했습니다." };
    }
    revalidatePath(`/products/${productSlug}`);
    return { ok: true };
  }

  if (!password) return { ok: false, error: "비밀번호를 입력해주세요." };
  const validated = verifyReviewPasswordSchema.safeParse({ password });
  if (!validated.success) {
    return { ok: false, error: validated.error.errors[0].message };
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("password_hash")
    .eq("id", reviewId)
    .maybeSingle();
  if (!review) return { ok: false, error: "후기를 찾을 수 없습니다." };

  const passOk = await verifyPassword(password, review.password_hash);
  if (!passOk) return { ok: false, error: "비밀번호가 일치하지 않습니다." };

  const admin = createAdminClient();
  const { error } = await admin.from("reviews").delete().eq("id", reviewId);
  if (error) {
    console.error("Self delete review failed:", error);
    return { ok: false, error: "삭제에 실패했습니다." };
  }

  revalidatePath(`/products/${productSlug}`);
  return { ok: true };
}
