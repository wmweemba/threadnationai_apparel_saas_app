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

// Steps 3 and 4 involve the AI image generation — can take 30–90s on free tier
const SLOW_STEPS = new Set([3, 4]);

interface ProgressFeedProps {
  current: ProgressStep | null;
}

export function ProgressFeed({ current }: ProgressFeedProps) {
  const currentStep = current?.step ?? 0;
  const percent = current?.percent ?? 0;
  const [elapsed, setElapsed] = useState(0);

  // Reset elapsed timer whenever the active step changes
  useEffect(() => {
    setElapsed(0);
    if (!SLOW_STEPS.has(currentStep)) return;

    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [currentStep]);

  const slowHint = SLOW_STEPS.has(currentStep) && elapsed >= 15;

  return (
    <div className="bg-surface-card rounded-card border border-border p-6 space-y-6 animate-fade-in">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-secondary">
            {current?.message ?? "Initialising..."}
          </span>
          <span className="text-accent font-medium">{percent}%</span>
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
                  ${isDone ? "bg-success text-white" : ""}
                  ${isActive ? "bg-accent text-background animate-pulse-gold" : ""}
                  ${isPending ? "bg-surface-elevated text-text-secondary border border-border" : ""}
                `}
              >
                {isDone ? "✓" : step}
              </div>
              <span
                className={`text-sm transition-colors ${
                  isDone
                    ? "text-text-secondary line-through"
                    : isActive
                    ? "text-text-primary font-medium"
                    : "text-text-secondary"
                }`}
              >
                {message}
              </span>
              {isActive && (
                <span className="ml-auto text-xs text-text-secondary animate-pulse">
                  {elapsed > 0 ? `${elapsed}s` : "..."}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer — updates when generation is taking a while */}
      <div className="text-center space-y-1">
        {slowHint ? (
          <>
            <p className="text-xs text-accent animate-pulse font-medium">
              AI is working hard on your image...
            </p>
            <p className="text-xs text-text-secondary">
              Free tier can take up to 90 seconds · Please keep this tab open
            </p>
          </>
        ) : (
          <p className="text-xs text-text-secondary">
            ~45–90 seconds · Please keep this tab open
          </p>
        )}
      </div>
    </div>
  );
}
