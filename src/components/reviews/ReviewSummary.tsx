import {
  getAverageRating,
  getReviewCountByProductId,
} from "@/lib/supabase/queries/reviews";

import { StarRating } from "@/components/reviews/StarRating";

interface ReviewSummaryProps {
  productId: string;
}

export async function ReviewSummary({ productId }: ReviewSummaryProps) {
  const [avg, count] = await Promise.all([
    getAverageRating(productId),
    getReviewCountByProductId(productId),
  ]);

  if (count === 0 || avg === null) {
    return (
      <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        아직 후기가 없습니다. 첫 번째 후기를 남겨주세요.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 rounded-md border bg-muted/30 p-5 sm:p-6">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-bold leading-none md:text-4xl">
          {avg.toFixed(1)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">/ 5.0</p>
      </div>
      <div className="space-y-1">
        <StarRating value={Math.round(avg)} size="lg" />
        <p className="text-sm text-muted-foreground">총 {count}개의 후기</p>
      </div>
    </div>
  );
}
