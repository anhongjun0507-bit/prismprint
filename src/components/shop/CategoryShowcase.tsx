import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getCategoryStyle } from "@/lib/categoryStyles";
import { cn } from "@/lib/utils";

import type { Category } from "@/types";

interface CategoryShowcaseProps {
  categories: Category[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section aria-label="카테고리" className="space-y-7 md:space-y-9">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary">
            CATEGORY
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            카테고리
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
            원하는 인쇄물을 카테고리에서 빠르게 찾아보세요.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {categories.map((category) => {
          const style = getCategoryStyle(category.slug);
          const Icon = style.icon;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-xl border bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 sm:p-5"
            >
              <div
                aria-hidden
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity duration-300 group-hover:opacity-100",
                  style.gradient,
                )}
              />
              <div className="relative flex items-start justify-between">
                <div
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 sm:h-11 sm:w-11",
                    style.iconBg,
                  )}
                >
                  <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", style.iconColor)} />
                </div>
                <ArrowRight
                  className={cn(
                    "h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100",
                    style.iconColor,
                  )}
                />
              </div>
              <div className="relative space-y-0.5">
                <h3 className="text-base font-bold text-foreground sm:text-lg">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="line-clamp-1 text-xs text-foreground/70 sm:text-sm">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
