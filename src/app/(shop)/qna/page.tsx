import Link from "next/link";
import { Pencil } from "lucide-react";

import { getQnaPosts } from "@/lib/supabase/queries/qna";

import { Button } from "@/components/ui/button";
import { QnaPostCard } from "@/components/qna/QnaPostCard";

export const metadata = {
  title: "Q&A",
};

interface QnaListPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function QnaListPage({ searchParams }: QnaListPageProps) {
  const sp = await searchParams;
  const pageParam = Number.parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const { posts, total, totalPages } = await getQnaPosts(page);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="mb-6 flex items-end justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Q&amp;A</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            궁금한 점은 자유롭게 문의해주세요. 답변은 영업일 기준 1~2일 내 등록됩니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/qna/new" className="gap-1">
            <Pencil className="h-4 w-4" />
            글쓰기
          </Link>
        </Button>
      </header>

      {posts.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          등록된 글이 없습니다. 첫 번째 문의를 작성해보세요.
        </div>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <QnaPostCard post={post} />
            </li>
          ))}
        </ul>
      )}

      {total > 0 && (
        <nav className="mt-6 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            총 <span className="font-semibold text-foreground">{total}</span>건 ·
            {" "}
            {page}/{totalPages} 페이지
          </p>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={page <= 1}
            >
              <Link
                href={`/qna?page=${Math.max(1, page - 1)}`}
                aria-disabled={page <= 1}
              >
                이전
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
            >
              <Link
                href={`/qna?page=${Math.min(totalPages, page + 1)}`}
                aria-disabled={page >= totalPages}
              >
                다음
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
