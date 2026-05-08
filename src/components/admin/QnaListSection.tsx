import Link from "next/link";
import { Lock } from "lucide-react";

import { formatQnaDate } from "@/lib/qna-format";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { AdminQnaPost } from "@/lib/supabase/queries/admin-board";

interface QnaListSectionProps {
  posts: AdminQnaPost[];
}

export function QnaListSection({ posts }: QnaListSectionProps) {
  if (posts.length === 0) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-md border border-dashed bg-background text-sm text-muted-foreground">
        조건에 맞는 글이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">상태</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-28">작성자</TableHead>
            <TableHead className="w-40">작성일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id} className="hover:bg-muted/40">
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                    post.is_answered
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "border-amber-300 bg-amber-50 text-amber-700",
                  )}
                >
                  {post.is_answered ? "답변완료" : "미답변"}
                </span>
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/board/qna/${post.id}`}
                  className="flex items-center gap-1.5 text-sm hover:underline"
                >
                  {post.is_secret && (
                    <Lock
                      aria-label="비밀글"
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    />
                  )}
                  <span className="line-clamp-1">{post.title}</span>
                </Link>
              </TableCell>
              <TableCell className="text-sm">{post.author_name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatQnaDate(post.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
