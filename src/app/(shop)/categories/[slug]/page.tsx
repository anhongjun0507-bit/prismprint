import { notFound } from "next/navigation";

import { getCategoryStyle } from "@/lib/categoryStyles";
import { getCategoryBySlug } from "@/lib/supabase/queries/categories";
import { getProductsByCategoryId } from "@/lib/supabase/queries/products";
import { cn } from "@/lib/utils";

import { ProductGrid } from "@/components/shop/ProductGrid";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategoryId(category.id);
  const style = getCategoryStyle(category.slug);
  const Icon = style.icon;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <header
        className={cn(
          "relative mb-8 overflow-hidden rounded-2xl border bg-gradient-to-br p-6 sm:p-8 md:mb-12",
          style.gradient,
        )}
      >
        <div className="relative flex flex-col gap-3">
          <div
            className={cn(
              "inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-sm sm:h-14 sm:w-14",
              style.iconBg,
            )}
          >
            <Icon className={cn("h-6 w-6 sm:h-7 sm:w-7", style.iconColor)} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-1 text-sm text-foreground/70 md:text-base">
                {category.description}
              </p>
            )}
          </div>
          <p className="text-xs text-foreground/60 md:text-sm">
            총{" "}
            <span className="font-semibold text-foreground">
              {products.length}
            </span>
            개의 상품
          </p>
        </div>
      </header>

      <ProductGrid products={products} />
    </div>
  );
}
