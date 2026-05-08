import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import type { CartItem } from "@/types";

/**
 * 비회원 장바구니 store.
 *
 * 결정에 시간이 걸리는 인쇄물 주문 특성을 고려해 sessionStorage가 아닌
 * localStorage로 영구화한다. 같은 product_id + selected_options + custom_data
 * 조합은 한 줄로 머지하고, 다르면 별도 row로 추가한다.
 *
 * Phase 2에 회원 로그인 도입 시: 로그인 직후 이 store의 items를 supabase
 * carts 테이블로 1회 sync하고 store는 가벼운 캐시로 격하시킨다.
 */

export type AddCartItemInput = Omit<
  CartItem,
  "id" | "added_at" | "subtotal"
>;

interface CartState {
  items: CartItem[];
  addItem: (input: AddCartItemInput) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalQuantity: () => number;
  getItemCount: () => number;
}

const STORE_KEY = "prismprint-cart-v1";

function isSameItem(existing: CartItem, input: AddCartItemInput): boolean {
  return (
    existing.product_id === input.product_id &&
    JSON.stringify(existing.selected_options) ===
      JSON.stringify(input.selected_options) &&
    JSON.stringify(existing.custom_data) === JSON.stringify(input.custom_data)
  );
}

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `cart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

// SSR 시 localStorage가 없어 persist가 throw하지 않도록 noop으로 대체.
const ssrSafeStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input) => {
        set((state) => {
          const idx = state.items.findIndex((it) => isSameItem(it, input));
          if (idx >= 0) {
            const existing = state.items[idx];
            const newQuantity = existing.quantity + input.quantity;
            const next = state.items.slice();
            next[idx] = {
              ...existing,
              quantity: newQuantity,
              subtotal: existing.unit_price * newQuantity,
            };
            return { items: next };
          }
          const item: CartItem = {
            ...input,
            id: generateId(),
            subtotal: input.unit_price * input.quantity,
            added_at: new Date().toISOString(),
          };
          return { items: [...state.items, item] };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((it) =>
            it.id === id
              ? {
                  ...it,
                  quantity,
                  subtotal: it.unit_price * quantity,
                }
              : it,
          ),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((it) => it.id !== id),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalAmount: () =>
        get().items.reduce((sum, it) => sum + it.subtotal, 0),
      getTotalQuantity: () =>
        get().items.reduce((sum, it) => sum + it.quantity, 0),
      getItemCount: () => get().items.length,
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : ssrSafeStorage,
      ),
      partialize: (state) => ({ items: state.items }),
      version: 1,
    },
  ),
);
