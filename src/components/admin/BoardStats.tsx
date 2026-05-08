import { getBoardStats } from "@/lib/supabase/queries/admin-board";
import { cn } from "@/lib/utils";

export async function BoardStats() {
  const stats = await getBoardStats();

  const cards = [
    {
      label: "미답변 Q&A",
      value: stats.unanswered_qna,
      urgent: stats.unanswered_qna > 0,
    },
    {
      label: "전체 Q&A",
      value: stats.total_qna,
      urgent: false,
    },
    {
      label: "숨김 후기",
      value: stats.hidden_reviews,
      urgent: false,
    },
    {
      label: "전체 후기",
      value: stats.total_reviews,
      urgent: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "flex flex-col gap-2 rounded-lg border bg-background p-4",
            card.urgent && "border-amber-300 bg-amber-50",
          )}
        >
          <span className="text-xs font-medium text-muted-foreground">
            {card.label}
          </span>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums md:text-3xl",
              card.urgent
                ? "text-amber-700"
                : card.value === 0
                  ? "text-muted-foreground/50"
                  : "text-foreground",
            )}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
