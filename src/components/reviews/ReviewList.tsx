import { createClient } from "@/lib/supabase/server";
import { formatQnaDateShort } from "@/lib/qna-format";
import { getReviewsByProductId } from "@/lib/supabase/queries/reviews";

import { ReviewDeleteButton } from "@/components/reviews/ReviewDeleteButton";
import { StarRating } from "@/components/reviews/StarRating";

interface ReviewListProps {
  productId: string;
  productSlug: string;
}

export async function ReviewList({ productId, productSlug }: ReviewListProps) {
  const { reviews } = await getReviewsByProductId(productId, 1);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user !== null;

  if (reviews.length === 0) {
    // 빈 상태는 ReviewSummary 가 표시하므로 여기선 null.
    return null;
  }

  return (
    <ul className="divide-y rounded-md border bg-background">
      {reviews.map((review) => (
        <li key={review.id} className="space-y-2 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <StarRating value={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {review.author_name} ·{" "}
                {formatQnaDateShort(review.created_at)}
              </span>
            </div>
            <ReviewDeleteButton
              reviewId={review.id}
              productSlug={productSlug}
              isAdmin={isAdmin}
            />
          </div>
          {review.title && (
            <h4 className="text-sm font-semibold text-foreground">
              {review.title}
            </h4>
          )}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {review.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
