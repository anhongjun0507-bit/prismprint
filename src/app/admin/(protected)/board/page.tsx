import Link from "next/link";

import {
  getAdminQnaPosts,
  getAdminReviews,
} from "@/lib/supabase/queries/admin-board";
import { cn } from "@/lib/utils";

import { AdminBoardFilters } from "@/components/admin/AdminBoardFilters";
import { BoardStats } from "@/components/admin/BoardStats";
import { Button } from "@/components/ui/button";
import { QnaListSection } from "@/components/admin/QnaListSection";
import { ReviewListSection } from "@/components/admin/ReviewListSection";

export const metadata = {
  title: "게시판 관리",
};

interface SearchParams {
  tab?: string;
  // qna
  isAnswered?: string;
  q?: string;
  // reviews
  isVisible?: string;
  ratingMin?: string;
  // common
  page?: string;
}

export default async function AdminBoardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "reviews" ? "reviews" : "qna";
  const pageParam = Number.parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const isAnswered =
    sp.isAnswered === "true" || sp.isAnswered === "false"
      ? sp.isAnswered
      : "all";
  const q = sp.q ?? "";
  const isVisible =
    sp.isVisible === "true" || sp.isVisible === "false" ? sp.isVisible : "all";
  const ratingMinParam = Number.parseInt(sp.ratingMin ?? "1", 10);
  const ratingMin = Number.isFinite(ratingMinParam) ? ratingMinParam : 1;

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (tab === "reviews") params.set("tab", "reviews");
    if (tab === "qna") {
      if (isAnswered !== "all") params.set("isAnswered", isAnswered);
      if (q) params.set("q", q);
    } else {
      if (isVisible !== "all") params.set("isVisible", isVisible);
      if (ratingMin > 1) params.set("ratingMin", String(ratingMin));
    }
    if (p !== 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/board?${qs}` : "/admin/board";
  };

  let qnaResult = null;
  let reviewResult = null;
  if (tab === "qna") {
    qnaResult = await getAdminQnaPosts({
      isAnswered: isAnswered as "all" | "true" | "false",
      searchQuery: q,
      page,
    });
  } else {
    reviewResult = await getAdminReviews({
      isVisible: isVisible as "all" | "true" | "false",
      ratingMin,
      page,
    });
  }

  const total = qnaResult?.total ?? reviewResult?.total ?? 0;
  const totalPages = qnaResult?.totalPages ?? reviewResult?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-xl font-bold md:text-2xl">게시판 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Q&amp;A 답변 작성과 후기 노출/삭제를 처리합니다.
        </p>
      </header>

      <BoardStats />

      <nav
        aria-label="게시판 탭"
        className="mt-6 flex gap-1 border-b"
      >
        <TabLink active={tab === "qna"} href="/admin/board?tab=qna">
          Q&amp;A
        </TabLink>
        <TabLink active={tab === "reviews"} href="/admin/board?tab=reviews">
          후기
        </TabLink>
      </nav>

      <div className="mt-5 space-y-5">
        <AdminBoardFilters
          tab={tab}
          isAnswered={isAnswered}
          query={q}
          isVisible={isVisible}
          ratingMin={String(ratingMin)}
        />

        {tab === "qna" && qnaResult && (
          <QnaListSection posts={qnaResult.posts} />
        )}
        {tab === "reviews" && reviewResult && (
          <ReviewListSection reviews={reviewResult.reviews} />
        )}

        {total > 0 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              총 <span className="font-semibold text-foreground">{total}</span>건 ·{" "}
              {page}/{totalPages} 페이지
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" disabled={page <= 1}>
                <Link href={buildPageUrl(Math.max(1, page - 1))}>이전</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
              >
                <Link href={buildPageUrl(Math.min(totalPages, page + 1))}>
                  다음
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TabLinkProps {
  active: boolean;
  href: string;
  children: React.ReactNode;
}

function TabLink({ active, href, children }: TabLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
