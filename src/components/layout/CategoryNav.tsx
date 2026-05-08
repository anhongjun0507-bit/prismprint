"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import type { Category } from "@/types";

interface CategoryNavProps {
  categories: Category[];
  orientation?: "horizontal" | "vertical";
  onItemClick?: () => void;
}

export function CategoryNav({
  categories,
  orientation = "horizontal",
  onItemClick,
}: CategoryNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="카테고리"
      className={cn(
        orientation === "horizontal"
          ? "flex items-center gap-1"
          : "flex flex-col py-2",
      )}
    >
      {categories.map((category) => {
        const href = `/categories/${category.slug}`;
        const isActive =
          pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={category.id}
            href={href}
            onClick={onItemClick}
            className={cn(
              "transition-colors",
              orientation === "horizontal"
                ? cn(
                    "px-3 py-2 text-sm font-medium border-b-2 -mb-px",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )
                : cn(
                    "px-5 py-3 text-base border-l-2",
                    isActive
                      ? "border-primary text-foreground font-semibold bg-muted"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  ),
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
