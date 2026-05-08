import Image from "next/image";
import Link from "next/link";

import { getCategoryStyle } from "@/lib/categoryStyles";
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
  const style = getCategoryStyle(categorySlug);
  const Icon = style.icon;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              "flex h-full w-full items-center justify-center bg-gradient-to-br transition-transform duration-500 group-hover:scale-105",
              style.gradient,
            )}
          >
            <div
              className={cn(
                "inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20",
                style.iconBg,
              )}
            >
              <Icon
                className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10",
                  style.iconColor,
                )}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-3 sm:p-4">
        <span className="text-[11px] font-semibold tracking-wider text-primary/80">
          {categoryName}
        </span>
        <h3 className="line-clamp-2 text-sm font-medium text-foreground sm:text-base">
          {product.name}
        </h3>
        <p className="mt-1 text-base font-bold text-foreground sm:text-lg">
          {formatPrice(product.base_price)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            부터
          </span>
        </p>
      </div>
    </Link>
  );
}
