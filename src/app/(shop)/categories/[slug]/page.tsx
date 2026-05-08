import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/lib/supabase/queries/categories";
import { getProductsByCategoryId } from "@/lib/supabase/queries/products";

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <header className="mb-6 md:mb-10">
        <h1 className="text-2xl font-bold md:text-3xl">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          총{" "}
          <span className="font-semibold text-foreground">
            {products.length}
          </span>
          개의 상품
        </p>
      </header>

      <ProductGrid products={products} />
    </div>
  );
}
