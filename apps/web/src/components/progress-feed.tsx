"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import type { ProgressStep } from "@/hooks/use-generation";

const ALL_STEPS = [
  { step: 1, message: "Analyzing fabric details..." },
  { step: 2, message: "Checking image quality..." },
  { step: 3, message: "Placing model in selected setting..." },
  { step: 4, message: "Generating studio-quality image..." },
  { step: 5, message: "Crafting high-converting captions..." },
];

const SLOW_STEPS = new Set([3, 4]);

interface ProgressFeedProps {
  current: ProgressStep | null;
}

export function ProgressFeed({ current }: ProgressFeedProps) {
  const currentStep = current?.step ?? 0;
  const percent = current?.percent ?? 0;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    if (!SLOW_STEPS.has(currentStep)) return;

    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [currentStep]);

  const slowHint = SLOW_STEPS.has(currentStep) && elapsed >= 15;

  return (
    <div className="bg-surface-card rounded-card border border-[rgba(255,255,255,0.08)] p-6 space-y-6 animate-fade-in">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-warm-dim">
            {current?.message ?? "Initialising..."}
          </span>
          <span className="text-kente-gold font-medium">{percent}%</span>
        </div>
        <Progress value={percent} className="h-1.5 bg-surface-elevated" />
      </div>

      {/* Step list */}
      <div className="space-y-3">
        {ALL_STEPS.map(({ step, message }) => {
          const isDone = step < currentStep;
          const isActive = step === currentStep;
          const isPending = step > currentStep;

          return (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium transition-all
                  ${isDone ? "bg-kente-gold text-midnight" : ""}
                  ${isActive ? "bg-kente-gold text-midnight animate-pulse-gold" : ""}
                  ${isPending ? "bg-surface-elevated text-warm-dim border border-[rgba(255,255,255,0.08)]" : ""}
                `}
              >
                {isDone ? "✓" : step}
              </div>
              <span
                className={`text-sm transition-colors ${
                  isDone
                    ? "text-kente-gold"
                    : isActive
                    ? "text-text-primary font-medium"
                    : "text-warm-dim"
                }`}
              >
                {message}
              </span>
              {isActive && (
                <span className="ml-auto text-xs text-warm-dim animate-pulse">
                  {elapsed > 0 ? `${elapsed}s` : "..."}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center space-y-1">
        {slowHint ? (
          <>
            <p className="text-xs text-kente-gold animate-pulse font-medium">
              AI is working hard on your image...
            </p>
            <p className="text-xs text-warm-dim">
              Free tier can take up to 90 seconds · Please keep this tab open
            </p>
          </>
        ) : (
          <p className="text-xs text-warm-dim">
            ~45–90 seconds · Please keep this tab open
          </p>
        )}
      </div>
    </div>
  );
}
