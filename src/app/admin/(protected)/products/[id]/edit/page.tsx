import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getAdminProductDetail } from "@/lib/supabase/queries/admin-products";
import { getActiveCategories } from "@/lib/supabase/queries/categories";

import { ProductForm } from "@/components/admin/ProductForm";

import type { ProductInput } from "@/lib/validations/product";

export const metadata = {
  title: "상품 수정",
};

interface AdminProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductDetail(id),
    getActiveCategories(),
  ]);
  if (!product) notFound();

  // jsonb 컬럼은 Json 으로 추론되므로 도메인 입력 형태로 캐스팅.
  const defaults: Partial<ProductInput> = {
    category_id: product.category_id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? "",
    base_price: product.base_price,
    thumbnail_url: product.thumbnail_url ?? "",
    images: (product.images as ProductInput["images"]) ?? [],
    options: (product.options as ProductInput["options"]) ?? [],
    is_active: product.is_active,
    display_order: product.display_order,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        목록으로
      </Link>

      <header className="mb-6 border-b pb-4">
        <h1 className="text-xl font-bold md:text-2xl">상품 수정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.name} ·{" "}
          <span className="font-mono">{product.slug}</span>
        </p>
      </header>

      <ProductForm
        categories={categories}
        defaultValues={defaults}
        productId={product.id}
      />
    </div>
  );
}
