import Link from "next/link";
import { Star } from "lucide-react";

import { formatQnaDate } from "@/lib/qna-format";
import { cn } from "@/lib/utils";

import { ReviewVisibilityToggle } from "@/components/admin/ReviewVisibilityToggle";
import { ReviewDeleteButton } from "@/components/reviews/ReviewDeleteButton";

import type { AdminReview } from "@/lib/supabase/queries/admin-board";

interface ReviewListSectionProps {
  reviews: AdminReview[];
}

export function ReviewListSection({ reviews }: ReviewListSectionProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-md border border-dashed bg-background text-sm text-muted-foreground">
        조건에 맞는 후기가 없습니다.
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-md border bg-background">
      {reviews.map((review) => (
        <li key={review.id} className="space-y-2 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Stars value={review.rating} />
              <span className="text-xs text-muted-foreground">
                {review.author_name} · {formatQnaDate(review.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ReviewVisibilityToggle
                reviewId={review.id}
                isVisible={review.is_visible}
              />
              <ReviewDeleteButton
                reviewId={review.id}
                productSlug={review.product?.slug ?? ""}
                isAdmin={true}
              />
            </div>
          </div>
          {review.product && (
            <Link
              href={`/products/${review.product.slug}`}
              className="inline-block text-xs font-medium text-primary hover:underline"
            >
              {review.product.name}
            </Link>
          )}
          {review.title && (
            <h4 className="text-sm font-semibold">{review.title}</h4>
          )}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {review.content}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${value}점`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-3.5 w-3.5",
            n <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}
