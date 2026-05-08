import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductBySlug } from "@/lib/supabase/queries/products";
import { formatPrice } from "@/lib/utils";

import { ProductDetailClient } from "@/components/shop/ProductDetailClient";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewSummary } from "@/components/reviews/ReviewSummary";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// 받는 사람 정보를 추가로 받아야 하는 카테고리 slug.
// Phase 2에는 카테고리 코드 상수에 `requires_custom_data` 플래그로 옮긴다.
const CATEGORIES_REQUIRING_CUSTOM_DATA: ReadonlySet<string> = new Set([
  "business-card",
]);

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const requiresCustomData = CATEGORIES_REQUIRING_CUSTOM_DATA.has(
    product.category.slug,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <div className="grid gap-6 md:gap-10 lg:grid-cols-2">
        <ProductGallery
          product={product}
          categorySlug={product.category.slug}
        />

        <div className="space-y-4 md:space-y-5">
          <Link
            href={`/categories/${product.category.slug}`}
            className="inline-block text-xs font-medium text-primary hover:underline"
          >
            {product.category.name}
          </Link>

          <h1 className="text-2xl font-bold leading-tight md:text-3xl">
            {product.name}
          </h1>

          <p className="text-2xl font-bold md:text-3xl">
            {formatPrice(product.base_price)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              부터
            </span>
          </p>

          {product.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          <hr className="border-t" />

          <ProductDetailClient
            product={product}
            requiresCustomData={requiresCustomData}
          />
        </div>
      </div>

      <section className="mt-12 border-t pt-10 md:mt-16">
        <Tabs defaultValue="detail" className="w-full">
          <TabsList>
            <TabsTrigger value="detail">상품 상세 정보</TabsTrigger>
            <TabsTrigger value="reviews">후기</TabsTrigger>
          </TabsList>
          <TabsContent value="detail" className="mt-6">
            <div className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              이미지·상세 설명이 들어갈 영역
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6 space-y-6">
            <ReviewSummary productId={product.id} />
            <ReviewList productId={product.id} productSlug={product.slug} />
            <ReviewForm productId={product.id} productSlug={product.slug} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
