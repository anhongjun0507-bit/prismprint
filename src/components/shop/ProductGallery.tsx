import Image from "next/image";

import { getCategoryGradient } from "@/lib/categoryStyles";
import { cn } from "@/lib/utils";

import type { Product } from "@/types";

interface ProductGalleryProps {
  product: Product;
  categorySlug: string;
}

export function ProductGallery({ product, categorySlug }: ProductGalleryProps) {
  const gradient = getCategoryGradient(categorySlug);
  const mainImage = product.images[0] ?? null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-md border bg-muted">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              "flex h-full w-full items-center justify-center bg-gradient-to-br text-base font-semibold text-foreground/40",
              gradient,
            )}
          >
            {product.name}
          </div>
        )}
      </div>

      {/* TODO(Phase 2): product.images 다중 이미지 시 thumbnail row 추가 */}
    </div>
  );
}
