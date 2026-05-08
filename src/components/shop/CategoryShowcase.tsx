import Link from "next/link";

import { getCategoryGradient } from "@/lib/categoryStyles";
import { cn } from "@/lib/utils";

import type { Category } from "@/types";

interface CategoryShowcaseProps {
  categories: Category[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section aria-label="카테고리" className="space-y-6 md:space-y-8">
      <header>
        <p className="text-xs font-bold tracking-widest text-primary">
          CATEGORY
        </p>
        <h2 className="mt-1 text-xl font-bold md:text-2xl">카테고리</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          원하는 인쇄물을 카테고리에서 빠르게 찾아보세요.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-md border bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity duration-200 group-hover:opacity-100",
                getCategoryGradient(category.slug),
              )}
            />
            <div className="relative space-y-1">
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
        ))}
      </div>
    </section>
  );
}
