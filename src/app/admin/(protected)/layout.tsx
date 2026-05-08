import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // middleware 가 1차 차단하지만, 직접 RSC 진입 시점에서도 한 번 더 검증.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <>
      <AdminNav />
      <main className="flex-1 bg-slate-50">{children}</main>
    </>
  );
}
