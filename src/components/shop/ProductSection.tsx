import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProductGrid } from "@/components/shop/ProductGrid";

import type { ProductWithCategory } from "@/types";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: ProductWithCategory[];
  viewAllHref?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
}: ProductSectionProps) {
  return (
    <section
      aria-label={title}
      className="space-y-6 md:space-y-8"
    >
      <header className="flex items-end justify-between gap-4">
        <div>
          {subtitle && (
            <p className="text-xs font-bold tracking-widest text-primary">
              {subtitle}
            </p>
          )}
          <h2 className="mt-1 text-xl font-bold md:text-2xl">{title}</h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            전체 보기
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </header>
      <ProductGrid products={products} />
    </section>
  );
}
