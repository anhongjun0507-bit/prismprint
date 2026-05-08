import Link from "next/link";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatQnaDateShort, maskAuthorName } from "@/lib/qna-format";

import type { QnaPostListItem } from "@/types";

interface QnaPostCardProps {
  post: QnaPostListItem;
}

export function QnaPostCard({ post }: QnaPostCardProps) {
  return (
    <Link
      href={`/qna/${post.id}`}
      className="flex items-center gap-3 border-b px-2 py-4 transition-colors hover:bg-muted/40 sm:gap-4 sm:px-3"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          {post.is_secret && (
            <Lock
              aria-label="비밀글"
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
            />
          )}
          <h3 className="truncate text-sm font-medium text-foreground sm:text-base">
            {post.is_secret ? "비밀글입니다" : post.title}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {maskAuthorName(post.author_name)} ·{" "}
          {formatQnaDateShort(post.created_at)}
        </p>
      </div>

      <span
        className={cn(
          "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
          post.is_answered
            ? "border-primary/30 bg-primary/5 text-primary"
            : "border-muted-foreground/30 text-muted-foreground",
        )}
      >
        {post.is_answered ? "답변완료" : "미답변"}
      </span>
    </Link>
  );
}
