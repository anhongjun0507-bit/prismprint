import Link from "next/link";

import { formatPrice } from "@/lib/utils";
import { formatQnaDate } from "@/lib/qna-format";

import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { OrderStatus } from "@/types";
import type { AdminOrder } from "@/lib/supabase/queries/admin-orders";

interface OrderListTableProps {
  orders: AdminOrder[];
}

export function OrderListTable({ orders }: OrderListTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-md border border-dashed bg-background text-sm text-muted-foreground">
        조건에 맞는 주문이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-44">주문번호</TableHead>
            <TableHead className="w-24">상태</TableHead>
            <TableHead>받는 사람</TableHead>
            <TableHead className="text-right">금액</TableHead>
            <TableHead className="w-32">입금자명</TableHead>
            <TableHead className="w-40">주문일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/40">
              <TableCell className="font-mono text-xs">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-primary hover:underline"
                >
                  {order.order_number}
                </Link>
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status as OrderStatus} />
              </TableCell>
              <TableCell className="text-sm">
                <div>{order.recipient_name}</div>
                <div className="text-xs text-muted-foreground">
                  {order.recipient_phone}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatPrice(order.total_amount)}
              </TableCell>
              <TableCell className="text-sm">{order.depositor_name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatQnaDate(order.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
