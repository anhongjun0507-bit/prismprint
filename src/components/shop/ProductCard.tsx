import Image from "next/image";
import Link from "next/link";

import { getCategoryGradient } from "@/lib/categoryStyles";
import { cn, formatPrice } from "@/lib/utils";

import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  categoryName: string;
  categorySlug: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  categoryName,
  categorySlug,
  priority,
}: ProductCardProps) {
  const gradient = getCategoryGradient(categorySlug);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              "flex h-full w-full items-center justify-center bg-gradient-to-br text-xs font-medium text-foreground/40",
              gradient,
            )}
          >
            {categoryName}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3 sm:p-4">
        <span className="text-xs font-medium text-primary">{categoryName}</span>
        <h3 className="line-clamp-2 text-sm font-medium text-foreground sm:text-base">
          {product.name}
        </h3>
        <p className="mt-1 text-base font-bold text-foreground sm:text-lg">
          {formatPrice(product.base_price)}
        </p>
      </div>
    </Link>
  );
}
