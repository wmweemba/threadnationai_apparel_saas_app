"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCredits } from "@/hooks/use-credits";

interface MockTopupModalProps {
  open: boolean;
  onClose: () => void;
}

export function MockTopupModal({ open, onClose }: MockTopupModalProps) {
  const { balance, topUp, topUpLoading } = useCredits();

  const handleTopUp = async () => {
    await topUp();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-surface-card border-[rgba(255,255,255,0.08)] max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-syne font-bold text-text-primary">
              Add Credits
            </DialogTitle>
            <span className="text-xs text-warm-dim border border-[rgba(255,255,255,0.08)] rounded-btn px-2 py-0.5">
              Demo Mode
            </span>
          </div>
        </DialogHeader>

        <Separator className="bg-[rgba(255,255,255,0.08)]" />

        <div className="py-2 space-y-4">
          <div className="bg-surface-elevated rounded-card p-4 flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">Current balance</p>
              <p className="text-warm-dim text-sm">
                Each generation costs 1 credit
              </p>
            </div>
            <div className="text-right">
              <p className="text-kente-gold font-syne font-extrabold text-2xl">
                {balance ?? "—"}
              </p>
              <p className="text-warm-dim text-xs">credits</p>
            </div>
          </div>

          <div className="bg-surface-elevated rounded-card p-4 border border-kente-gold/30 flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">Demo Top-Up</p>
              <p className="text-warm-dim text-sm">+5 credits, instant</p>
            </div>
            <p className="text-kente-gold font-syne font-extrabold text-lg">FREE</p>
          </div>

          <p className="text-xs text-warm-dim text-center">
            In production, credits are purchased via mobile money or card.
            This is a demo placeholder.
          </p>
        </div>

        <Button
          onClick={handleTopUp}
          disabled={topUpLoading}
          className="w-full bg-kente-gold hover:bg-kente-gold/90 text-midnight font-syne font-bold rounded-btn h-11"
        >
          {topUpLoading ? "Adding credits..." : "Demo: Add 5 Credits"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
