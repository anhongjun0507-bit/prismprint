import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductActiveToggle } from "@/components/admin/ProductActiveToggle";

import type { AdminProduct } from "@/lib/supabase/queries/admin-products";

interface ProductListTableProps {
  products: AdminProduct[];
}

export function ProductListTable({ products }: ProductListTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-md border border-dashed bg-background text-sm text-muted-foreground">
        조건에 맞는 상품이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">썸네일</TableHead>
            <TableHead>상품명</TableHead>
            <TableHead className="w-32">카테고리</TableHead>
            <TableHead className="w-28 text-right">가격</TableHead>
            <TableHead className="w-16 text-center">정렬</TableHead>
            <TableHead className="w-24">활성</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} className="hover:bg-muted/40">
              <TableCell>
                {p.thumbnail_url ? (
                  <Image
                    src={p.thumbnail_url}
                    alt={p.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-md border object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md border border-dashed bg-muted/30" />
                )}
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="block hover:underline"
                >
                  <span className="block text-sm font-medium">{p.name}</span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {p.slug}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {p.category?.name ?? "—"}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatPrice(p.base_price)}
              </TableCell>
              <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                {p.display_order}
              </TableCell>
              <TableCell>
                <ProductActiveToggle
                  productId={p.id}
                  isActive={p.is_active}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
