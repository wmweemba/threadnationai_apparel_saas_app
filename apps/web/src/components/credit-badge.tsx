"use client";

import { useCredits } from "@/hooks/use-credits";
import { Skeleton } from "@/components/ui/skeleton";

interface CreditBadgeProps {
  onTopUpClick?: () => void;
}

export function CreditBadge({ onTopUpClick }: CreditBadgeProps) {
  const { balance, isLoading } = useCredits();

  if (isLoading) {
    return <Skeleton className="h-8 w-24 rounded-btn bg-surface-elevated" />;
  }

  const isLow = balance !== null && balance < 2;

  return (
    <button
      onClick={onTopUpClick}
      className={`
        flex items-center gap-1.5 border rounded-btn px-3 py-1.5 transition-colors
        ${
          isLow
            ? "bg-error/10 border-error/40 hover:border-error"
            : "bg-surface-elevated border-border hover:border-accent"
        }
      `}
    >
      <span className="text-accent text-sm">✦</span>
      <span
        className={`text-sm font-medium ${isLow ? "text-error" : "text-text-secondary"}`}
      >
        {balance ?? "—"} credits
      </span>
    </button>
  );
}
