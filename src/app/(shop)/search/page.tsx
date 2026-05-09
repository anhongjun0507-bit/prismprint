import { Search as SearchIcon } from "lucide-react";

import { searchProducts } from "@/lib/supabase/queries/products";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const metadata = {
  title: "상품 검색",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const products = query.length > 0 ? await searchProducts(query) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <header className="mb-8 border-b pb-6">
        <h1 className="text-2xl font-bold md:text-3xl">상품 검색</h1>

        <form action="/search" method="GET" className="mt-4 flex gap-2">
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="상품명을 입력하세요"
            aria-label="검색어"
            maxLength={50}
            autoFocus
            className="flex-1"
          />
          <Button type="submit">
            <SearchIcon className="h-4 w-4" />
            검색
          </Button>
        </form>

        {query.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            &ldquo;{query}&rdquo; 검색 결과{" "}
            <span className="font-semibold text-foreground">
              {products.length}
            </span>
            건
          </p>
        )}
      </header>

      {query.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          검색어를 입력해 주세요.
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
