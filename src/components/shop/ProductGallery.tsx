import Image from "next/image";

import { getCategoryStyle } from "@/lib/categoryStyles";
import { cn } from "@/lib/utils";

import type { Product } from "@/types";

interface ProductGalleryProps {
  product: Product;
  categorySlug: string;
}

export function ProductGallery({ product, categorySlug }: ProductGalleryProps) {
  const style = getCategoryStyle(categorySlug);
  const Icon = style.icon;
  const mainImage = product.images[0] ?? null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted">
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
              "flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br",
              style.gradient,
            )}
          >
            <div
              className={cn(
                "inline-flex h-24 w-24 items-center justify-center rounded-3xl shadow-sm",
                style.iconBg,
              )}
            >
              <Icon className={cn("h-12 w-12", style.iconColor)} />
            </div>
            <p className="text-sm font-semibold text-foreground/50">
              {product.name}
            </p>
          </div>
        )}
      </div>

      {/* TODO(Phase 2): product.images 다중 이미지 시 thumbnail row 추가 */}
    </div>
  );
}
