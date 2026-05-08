import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";

import { getAdminQnaPostDetail } from "@/lib/supabase/queries/admin-board";
import { formatQnaDate } from "@/lib/qna-format";

import { AdminQnaReplyForm } from "@/components/admin/AdminQnaReplyForm";
import { QnaPostDeleteButton } from "@/components/admin/QnaPostDeleteButton";
import { QnaReplyItem } from "@/components/admin/QnaReplyItem";

interface AdminQnaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminQnaDetailPage({
  params,
}: AdminQnaDetailPageProps) {
  const { id } = await params;
  const detail = await getAdminQnaPostDetail(id);
  if (!detail) notFound();
  const { post, replies } = detail;

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Link
        href="/admin/board?tab=qna"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Q&amp;A 목록으로
      </Link>

      <header className="border-b pb-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="flex items-center gap-2 text-xl font-bold leading-tight md:text-2xl">
            {post.is_secret && (
              <Lock
                aria-label="비밀글"
                className="h-4 w-4 shrink-0 text-muted-foreground"
              />
            )}
            <span>{post.title}</span>
          </h1>
          <span
            className={
              post.is_answered
                ? "shrink-0 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary"
                : "shrink-0 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
            }
          >
            {post.is_answered ? "답변완료" : "미답변"}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {post.author_name} · {formatQnaDate(post.created_at)}
        </p>
      </header>

      <div className="mt-6 space-y-8">
        <div className="whitespace-pre-wrap rounded-md border bg-background p-5 text-sm leading-relaxed">
          {post.content}
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold md:text-lg">
            답변{" "}
            <span className="text-sm text-muted-foreground">
              ({replies.length})
            </span>
          </h2>
          {replies.length === 0 ? (
            <p className="rounded-md border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              아직 등록된 답변이 없습니다.
            </p>
          ) : (
            <ul className="space-y-3">
              {replies.map((reply) => (
                <QnaReplyItem key={reply.id} reply={reply} postId={post.id} />
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2 rounded-md border bg-muted/30 p-4">
          <h3 className="text-sm font-semibold">새 답변 작성</h3>
          <AdminQnaReplyForm postId={post.id} />
        </section>
      </div>

      <footer className="mt-10 flex justify-end border-t pt-5">
        <QnaPostDeleteButton postId={post.id} />
      </footer>
    </article>
  );
}
