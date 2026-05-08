import Link from "next/link";
import { Plus } from "lucide-react";

import {
  getAdminProducts,
  type AdminProductsFilters,
} from "@/lib/supabase/queries/admin-products";
import { getActiveCategories } from "@/lib/supabase/queries/categories";

import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/components/admin/ProductFilters";
import { ProductListTable } from "@/components/admin/ProductListTable";

export const metadata = {
  title: "상품 관리",
};

interface SearchParams {
  categoryId?: string;
  isActive?: string;
  q?: string;
  page?: string;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const categoryId = sp.categoryId ?? "all";
  const isActive = (sp.isActive === "true" || sp.isActive === "false"
    ? sp.isActive
    : "all") as AdminProductsFilters["isActive"];
  const q = sp.q ?? "";
  const pageParam = Number.parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getAdminProducts({
      categoryId,
      isActive,
      searchQuery: q,
      page,
    }),
    getActiveCategories(),
  ]);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (categoryId !== "all") params.set("categoryId", categoryId);
    if (isActive && isActive !== "all") params.set("isActive", isActive);
    if (q) params.set("q", q);
    if (p !== 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">상품 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            상품 등록·수정·이미지·옵션을 관리합니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new" className="gap-1">
            <Plus className="h-4 w-4" />
            새 상품
          </Link>
        </Button>
      </header>

      <ProductFilters
        categories={categories}
        categoryId={categoryId}
        isActive={isActive ?? "all"}
        query={q}
      />

      <div className="mt-6">
        <ProductListTable products={products} />
      </div>

      {total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            총 <span className="font-semibold text-foreground">{total}</span>건 ·{" "}
            {page}/{totalPages} 페이지
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <Link href={buildPageUrl(Math.max(1, page - 1))}>이전</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
            >
              <Link href={buildPageUrl(Math.min(totalPages, page + 1))}>
                다음
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
