import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { getActiveCategories } from "@/lib/supabase/queries/categories";

import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = {
  title: "새 상품 등록",
};

export default async function AdminProductNewPage() {
  const categories = await getActiveCategories();

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
        <h1 className="text-xl font-bold md:text-2xl">새 상품 등록</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          기본 정보·썸네일·옵션을 입력하고 등록하세요.
        </p>
      </header>

      <ProductForm categories={categories} />
    </div>
  );
}
