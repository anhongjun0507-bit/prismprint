"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { productSchema, type ProductInput } from "@/lib/validations/product";

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : T))
  | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function revalidateAfterMutation(slug?: string | null) {
  revalidatePath("/admin/products");
  revalidatePath("/");
  if (slug) revalidatePath(`/products/${slug}`);
}

function normalizeInput(values: ProductInput) {
  return {
    category_id: values.category_id,
    slug: values.slug,
    name: values.name,
    description: values.description?.trim() ? values.description : null,
    base_price: values.base_price,
    thumbnail_url: values.thumbnail_url?.trim() ? values.thumbnail_url : null,
    images: values.images,
    options: values.options,
    is_active: values.is_active,
    display_order: values.display_order,
  };
}

// ─────────────────────────────────────────
// 상품 생성
// ─────────────────────────────────────────
export async function createProductAction(
  input: ProductInput,
): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const validated = productSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, error: validated.error.errors[0].message };
  }

  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("slug", validated.data.slug)
    .maybeSingle();
  if (existing) return { ok: false, error: "이미 사용 중인 슬러그입니다." };

  const { data, error } = await supabase
    .from("products")
    .insert(normalizeInput(validated.data))
    .select("id, slug")
    .single();
  if (error || !data) {
    console.error("createProduct failed:", error);
    return { ok: false, error: "상품 등록에 실패했습니다." };
  }

  revalidateAfterMutation(data.slug);
  return { ok: true, id: data.id };
}

// ─────────────────────────────────────────
// 상품 수정
// ─────────────────────────────────────────
export async function updateProductAction(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const validated = productSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, error: validated.error.errors[0].message };
  }

  // slug 변경 시 자기 자신을 제외한 중복 체크
  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("slug", validated.data.slug)
    .maybeSingle();
  if (existing && existing.id !== id) {
    return { ok: false, error: "이미 사용 중인 슬러그입니다." };
  }

  // 이전 slug 도 함께 캐시 무효화
  const { data: prev } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("products")
    .update(normalizeInput(validated.data))
    .eq("id", id);
  if (error) {
    console.error("updateProduct failed:", error);
    return { ok: false, error: "상품 수정에 실패했습니다." };
  }

  if (prev?.slug && prev.slug !== validated.data.slug) {
    revalidatePath(`/products/${prev.slug}`);
  }
  revalidateAfterMutation(validated.data.slug);
  return { ok: true };
}

// ─────────────────────────────────────────
// 상품 삭제
// ─────────────────────────────────────────
export async function deleteProductAction(
  id: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const { data: prev } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("deleteProduct failed:", error);
    return { ok: false, error: "상품 삭제에 실패했습니다." };
  }

  revalidateAfterMutation(prev?.slug ?? null);
  return { ok: true };
}

// ─────────────────────────────────────────
// 활성/비활성 토글
// ─────────────────────────────────────────
export async function toggleProductActiveAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const { data: prev } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) {
    console.error("toggleProductActive failed:", error);
    return { ok: false, error: "상태 변경에 실패했습니다." };
  }

  revalidateAfterMutation(prev?.slug ?? null);
  return { ok: true };
}

// ─────────────────────────────────────────
// 이미지 업로드 (Supabase Storage)
// ─────────────────────────────────────────
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadProductImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const { user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const file = formData.get("file");
  const slugRaw = formData.get("slug");
  if (!(file instanceof File)) {
    return { ok: false, error: "파일이 없습니다." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "이미지는 5MB 이하만 업로드 가능합니다." };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return { ok: false, error: "JPEG·PNG·WebP 만 업로드 가능합니다." };
  }

  const safeSlug =
    typeof slugRaw === "string"
      ? slugRaw.replace(/[^a-z0-9-]/gi, "-").toLowerCase()
      : "";
  const folder = safeSlug.length > 0 ? safeSlug : "uncategorized";
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${folder}/${ts}-${rand}.${ext}`;

  const admin = createAdminClient();
  const { error: uploadErr } = await admin.storage
    .from("products")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
  if (uploadErr) {
    console.error("upload failed:", uploadErr);
    return { ok: false, error: "업로드에 실패했습니다." };
  }

  const { data: pub } = admin.storage.from("products").getPublicUrl(path);
  return { ok: true, url: pub.publicUrl };
}

// ─────────────────────────────────────────
// 이미지 삭제 (Supabase Storage)
// ─────────────────────────────────────────
export async function deleteProductImageAction(
  imageUrl: string,
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  // public URL 형식: https://{ref}.supabase.co/storage/v1/object/public/products/{path}
  const match = imageUrl.match(
    /\/storage\/v1\/object\/public\/products\/(.+)$/,
  );
  if (!match) return { ok: false, error: "잘못된 이미지 URL 입니다." };

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("products")
    .remove([match[1]]);
  if (error) {
    console.error("delete image failed:", error);
    return { ok: false, error: "이미지 삭제에 실패했습니다." };
  }
  return { ok: true };
}
