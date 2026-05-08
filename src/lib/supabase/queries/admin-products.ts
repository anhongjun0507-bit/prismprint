import { createClient } from "@/lib/supabase/server";

import type { Database } from "@/types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export interface AdminProduct extends ProductRow {
  category: { id: string; name: string; slug: string } | null;
}

export const ADMIN_PRODUCTS_PER_PAGE = 20;

export interface AdminProductsFilters {
  categoryId?: string | "all";
  isActive?: "true" | "false" | "all";
  searchQuery?: string;
  page?: number;
}

export interface AdminProductsResult {
  products: AdminProduct[];
  total: number;
  page: number;
  totalPages: number;
}

const SELECT_WITH_CATEGORY = "*, category:categories(id, name, slug)";

export async function getAdminProducts(
  filters: AdminProductsFilters = {},
): Promise<AdminProductsResult> {
  const supabase = await createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const from = (page - 1) * ADMIN_PRODUCTS_PER_PAGE;
  const to = from + ADMIN_PRODUCTS_PER_PAGE - 1;

  let query = supabase
    .from("products")
    .select(SELECT_WITH_CATEGORY, { count: "exact" })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.categoryId && filters.categoryId !== "all") {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.isActive === "true") query = query.eq("is_active", true);
  else if (filters.isActive === "false") query = query.eq("is_active", false);

  if (filters.searchQuery) {
    const q = filters.searchQuery.trim();
    if (q.length > 0) {
      query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
    }
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("Failed to fetch admin products:", error);
    return { products: [], total: 0, page, totalPages: 1 };
  }

  return {
    products: (data ?? []) as unknown as AdminProduct[],
    total: count ?? 0,
    page,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / ADMIN_PRODUCTS_PER_PAGE)),
  };
}

export async function getAdminProductDetail(
  id: string,
): Promise<AdminProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_CATEGORY)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("Failed to fetch admin product detail:", error);
    return null;
  }
  return (data as unknown as AdminProduct | null) ?? null;
}
