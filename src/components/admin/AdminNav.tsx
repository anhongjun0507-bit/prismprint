"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  MessagesSquare,
  Package,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { LogoutButton } from "@/components/admin/LogoutButton";

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  // exact 일치 (true) — 부분 매치(false)는 하위 라우트도 active 로 본다.
  exact?: boolean;
}

const NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "주문 관리", icon: ClipboardList },
  { href: "/admin/products", label: "상품 관리", icon: Package },
  { href: "/admin/board", label: "게시판 관리", icon: MessagesSquare },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-slate-900 text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 md:h-14 md:flex-row md:items-center md:gap-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-50"
        >
          <LayoutDashboard className="h-4 w-4" />
          관리자
        </Link>

        <nav
          aria-label="관리자 메뉴"
          className="flex flex-1 flex-wrap items-center gap-1 text-sm md:gap-2"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 transition-colors",
                  active
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
