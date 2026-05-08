import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";

import {
  getQnaPostById,
  getQnaReplies,
} from "@/lib/supabase/queries/qna";
import { createClient } from "@/lib/supabase/server";
import { formatQnaDate, maskAuthorName } from "@/lib/qna-format";

import { QnaDeleteButton } from "@/components/qna/QnaDeleteButton";
import { QnaReplies } from "@/components/qna/QnaReplies";
import { QnaReplyForm } from "@/components/qna/QnaReplyForm";
import { QnaSecretGate } from "@/components/qna/QnaSecretGate";

interface QnaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QnaDetailPage({ params }: QnaDetailPageProps) {
  const { id } = await params;

  const post = await getQnaPostById(id);
  if (!post) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user !== null;

  // 관리자가 아니고 비밀글이면 게이트 통과 전까지 본문·답변을 서버에서 보내지 않는다.
  const lockedForViewer = post.is_secret && !isAdmin;
  const replies = lockedForViewer ? [] : await getQnaReplies(post.id);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Link
        href="/qna"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        목록으로
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
                : "shrink-0 rounded-full border border-muted-foreground/30 px-2 py-0.5 text-xs font-medium text-muted-foreground"
            }
          >
            {post.is_answered ? "답변완료" : "미답변"}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {maskAuthorName(post.author_name)} · {formatQnaDate(post.created_at)}
        </p>
      </header>

      <div className="mt-6 space-y-8">
        {lockedForViewer ? (
          <QnaSecretGate postId={post.id} />
        ) : (
          <>
            <div className="whitespace-pre-wrap rounded-md border bg-background p-5 text-sm leading-relaxed">
              {post.content}
            </div>

            <section className="space-y-3">
              <h2 className="text-base font-bold md:text-lg">답변</h2>
              <QnaReplies replies={replies} />
            </section>

            {isAdmin && <QnaReplyForm postId={post.id} />}
          </>
        )}
      </div>

      <footer className="mt-10 flex justify-end border-t pt-5">
        <QnaDeleteButton postId={post.id} isAdmin={isAdmin} />
      </footer>
    </article>
  );
}
