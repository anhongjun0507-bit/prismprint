import {
  getBestProducts,
  getNewProducts,
} from "@/lib/supabase/queries/products";
import { categories } from "@/lib/categories";

import { CategoryShowcase } from "@/components/shop/CategoryShowcase";
import { HeroBanner } from "@/components/shop/HeroBanner";
import { ProductSection } from "@/components/shop/ProductSection";

export default async function HomePage() {
  const [newProducts, bestProducts] = await Promise.all([
    getNewProducts(8),
    getBestProducts(8),
  ]);

  return (
    <>
      <HeroBanner />

      <section
        id="categories"
        className="mx-auto max-w-7xl px-4 py-16 sm:py-20"
      >
        <CategoryShowcase categories={categories} />
      </section>

      <div className="border-y bg-gradient-to-b from-muted/40 to-muted/10">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <ProductSection
            title="신상품"
            subtitle="NEW"
            products={newProducts}
          />
        </section>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <ProductSection
          title="베스트"
          subtitle="BEST"
          products={bestProducts}
        />
      </section>
    </>
  );
}
