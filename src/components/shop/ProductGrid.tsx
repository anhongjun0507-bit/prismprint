import { cn } from "@/lib/utils";

import { ProductCard } from "@/components/shop/ProductCard";

import type { ProductWithCategory } from "@/types";

type GridColumns = "auto" | 2 | 3 | 4;

interface ProductGridProps {
  products: ProductWithCategory[];
  columns?: GridColumns;
}

const COLUMN_CLASSES: Record<GridColumns, string> = {
  auto: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function ProductGrid({ products, columns = "auto" }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        상품이 없습니다.
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:gap-6", COLUMN_CLASSES[columns])}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={product.category.name}
          categorySlug={product.category.slug}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
