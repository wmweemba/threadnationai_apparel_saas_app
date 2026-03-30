"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
      <h2 className="font-syne font-bold text-xl text-text-primary">
        Something went wrong
      </h2>
      <p className="text-text-secondary text-sm text-center max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <Button
        onClick={reset}
        className="bg-accent hover:bg-accent/90 text-background font-syne font-semibold rounded-btn"
      >
        Try again
      </Button>
    </div>
  );
}
