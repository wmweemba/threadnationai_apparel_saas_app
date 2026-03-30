"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PreviewCardProps {
  previewUrl: string;
  creditRefundEligible: boolean;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

export function PreviewCard({
  previewUrl,
  creditRefundEligible,
  onApprove,
  onReject,
}: PreviewCardProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove();
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await onReject();
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Watermarked preview */}
      <div className="relative rounded-card overflow-hidden bg-surface-elevated aspect-[3/4] max-h-[480px]">
        {!imageLoaded && (
          <Skeleton className="absolute inset-0 bg-surface-elevated" />
        )}
        <Image
          src={previewUrl}
          alt="Watermarked preview"
          fill
          className={`object-cover transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute top-3 left-3">
          <span className="bg-midnight/80 text-cream text-xs px-2 py-1 rounded-btn">
            Preview
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleApprove}
          disabled={approving || rejecting}
          className="bg-kente-gold hover:bg-kente-gold/90 text-midnight font-syne font-bold rounded-btn h-11"
        >
          {approving ? "Unlocking..." : "Unlock Full Res ✦"}
        </Button>
        <Button
          onClick={handleReject}
          disabled={rejecting || approving || !creditRefundEligible}
          variant="outline"
          className="border-[rgba(255,255,255,0.08)] text-warm-dim hover:text-text-primary hover:border-error rounded-btn h-11"
        >
          {rejecting
            ? "Processing..."
            : creditRefundEligible
            ? "Not quite right (+0.5 ✦)"
            : "Not quite right"}
        </Button>
      </div>

      {creditRefundEligible && (
        <p className="text-center text-xs text-warm-dim">
          Rejecting refunds 0.5 credits · Max 3 rejections/hour
        </p>
      )}
    </div>
  );
}
