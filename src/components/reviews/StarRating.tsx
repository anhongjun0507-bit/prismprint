import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type StarSize = "sm" | "md" | "lg";

interface StarRatingProps {
  value: number;
  size?: StarSize;
  className?: string;
}

const SIZE_CLASS: Record<StarSize, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

export function StarRating({ value, size = "md", className }: StarRatingProps) {
  const sizeClass = SIZE_CLASS[size];
  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value}점`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            sizeClass,
            n <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}
