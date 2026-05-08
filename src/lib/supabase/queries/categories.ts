import { createClient } from "@/lib/supabase/server";

import type { Category } from "@/types";

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
  return data as Category | null;
}

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
  return (data ?? []) as Category[];
}
