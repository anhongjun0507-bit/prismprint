import Link from "next/link";
import { Search } from "lucide-react";

import { mockCategories } from "@/lib/mock-data";

import { CartIcon } from "@/components/layout/CartIcon";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { MobileMenu } from "@/components/layout/MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 md:h-16 md:gap-6">
        <div className="flex items-center gap-2">
          <MobileMenu categories={mockCategories} />
          <Link
            href="/"
            className="text-lg font-bold tracking-tight md:text-xl"
            aria-label="프린트샵 홈"
          >
            프린트샵
          </Link>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <CategoryNav
            categories={mockCategories}
            orientation="horizontal"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href="/search"
            aria-label="검색"
            className="hidden h-9 w-9 items-center justify-center rounded-md hover:bg-muted md:inline-flex"
          >
            <Search className="h-5 w-5" />
          </Link>
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
