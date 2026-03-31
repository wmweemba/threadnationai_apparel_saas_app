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
        flex items-center gap-1.5 sm:gap-2 rounded-btn px-2 sm:px-3 py-1.5 transition-colors
        ${
          isLow
            ? "bg-error/10 hover:bg-error/15"
            : "bg-[rgba(201,168,76,0.12)] hover:bg-[rgba(201,168,76,0.18)]"
        }
      `}
    >
      <span
        className={`w-2 h-2 rounded-full ${isLow ? "bg-error" : "bg-kente-gold"}`}
      />
      <span
        className={`text-sm font-medium ${isLow ? "text-error" : "text-kente-gold"}`}
      >
        {balance ?? "—"}<span className="hidden sm:inline"> credits</span>
      </span>
    </button>
  );
}
