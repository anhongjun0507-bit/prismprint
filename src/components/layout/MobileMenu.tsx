"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryNav } from "@/components/layout/CategoryNav";

import type { Category } from "@/types";

interface MobileMenuProps {
  categories: Category[];
}

export function MobileMenu({ categories }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label="메뉴 열기"
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
      >
        <Menu className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="left-0 top-0 h-full w-[85vw] max-w-xs translate-x-0 translate-y-0 gap-0 rounded-none border-r border-l-0 border-t-0 border-b-0 p-0 sm:rounded-none flex flex-col"
      >
        <DialogTitle className="border-b px-5 py-4 text-base font-semibold">
          카테고리
        </DialogTitle>
        <div className="flex-1 overflow-y-auto">
          <CategoryNav
            categories={categories}
            orientation="vertical"
            onItemClick={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
