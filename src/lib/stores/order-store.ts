import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import type { Order, OrderItem } from "@/types";

/**
 * 비회원 주문 mock store.
 *
 * 같은 브라우저(localStorage)에서 만든 모든 주문이 누적된다.
 * Phase 2엔 supabase orders/order_items 테이블로 교체하고 이 store는 제거.
 *
 * TODO(Phase 2):
 *   - createOrder를 supabase Server Action 트랜잭션으로 교체
 *   - findOrder는 RLS 적용된 supabase select로 교체
 *   - 그 시점에 이 파일은 통째로 삭제
 */

export type OrderItemSnapshot = Omit<OrderItem, "id" | "order_id">;

export type CreateOrderInput = Omit<
  Order,
  | "id"
  | "order_number"
  | "status"
  | "tracking_number"
  | "paid_at"
  | "created_at"
  | "updated_at"
  | "items"
> & {
  items: OrderItemSnapshot[];
};

interface OrderState {
  orders: Order[];
  createOrder: (input: CreateOrderInput) => Order;
  findOrder: (
    orderNumber: string,
    phoneLast4: string,
  ) => Order | undefined;
  getAllOrders: () => Order[];
}

const STORE_KEY = "prismprint-orders-v1";

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function getKSTDateString(date: Date = new Date()): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function generateOrderNumber(orders: Order[]): string {
  const datePart = getKSTDateString();
  const prefix = `ORD-${datePart}-`;
  const todaysCount = orders.filter((o) =>
    o.order_number.startsWith(prefix),
  ).length;
  const sequence = String(todaysCount + 1).padStart(4, "0");
  return `${prefix}${sequence}`;
}

const ssrSafeStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (input) => {
        const now = new Date().toISOString();
        const orderId = generateId();
        const items: OrderItem[] = input.items.map((it) => ({
          ...it,
          id: generateId(),
          order_id: orderId,
        }));
        const order: Order = {
          ...input,
          id: orderId,
          items,
          order_number: generateOrderNumber(get().orders),
          status: "pending_payment",
          tracking_number: null,
          paid_at: null,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ orders: [...state.orders, order] }));
        return order;
      },

      findOrder: (orderNumber, phoneLast4) => {
        const normalized = phoneLast4.replace(/\D/g, "").slice(-4);
        return get().orders.find(
          (o) =>
            o.order_number === orderNumber &&
            o.recipient_phone.replace(/\D/g, "").slice(-4) === normalized,
        );
      },

      getAllOrders: () => get().orders,
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : ssrSafeStorage,
      ),
      partialize: (state) => ({ orders: state.orders }),
      version: 1,
    },
  ),
);
