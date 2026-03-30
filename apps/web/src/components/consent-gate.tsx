"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ConsentGateProps {
  open: boolean;
  onAccept: () => Promise<void>;
}

export function ConsentGate({ open, onAccept }: ConsentGateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await onAccept();
    } catch (err) {
      setError((err as Error).message ?? "Something went wrong. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-surface-card border-border max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-accent text-2xl font-syne font-bold">✦</span>
            <DialogTitle className="font-syne text-xl text-text-primary">
              ThreadNation AI
            </DialogTitle>
          </div>
          <p className="text-text-secondary text-sm">
            Before you start creating, please review how we handle your data.
          </p>
        </DialogHeader>

        <Separator className="bg-border" />

        <div className="space-y-4 py-2">
          <h3 className="font-syne font-semibold text-text-primary">
            Zambia Data Protection Act 2021 — Your Rights
          </h3>

          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="text-accent mt-0.5 flex-shrink-0">✦</span>
              <span>
                Your garment photos are processed by AI services operating
                internationally (OpenRouter, Fal.ai) to generate studio-quality
                images.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent mt-0.5 flex-shrink-0">✦</span>
              <span>
                Uploaded images are automatically deleted within 24 hours and
                are <strong className="text-text-primary">never</strong> used to
                train AI models.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent mt-0.5 flex-shrink-0">✦</span>
              <span>
                Generated images are stored securely and only visible to you.
                You retain full ownership.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent mt-0.5 flex-shrink-0">✦</span>
              <span>
                You may request deletion of your data at any time by contacting
                support.
              </span>
            </li>
          </ul>
        </div>

        <Separator className="bg-border" />

        <div className="pt-2">
          {error && (
            <p className="text-error text-xs text-center mb-3">{error}</p>
          )}
          <Button
            onClick={handleAccept}
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-background font-syne font-semibold rounded-btn h-11"
          >
            {loading ? "Saving..." : "Accept & Start Creating"}
          </Button>
          <p className="text-center text-xs text-text-secondary mt-3">
            By accepting you agree to the processing described above under
            Zambia&apos;s Data Protection Act 2021.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
