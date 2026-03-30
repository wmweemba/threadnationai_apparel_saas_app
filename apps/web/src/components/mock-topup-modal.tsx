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
      <DialogContent className="bg-surface-card border-border max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-syne text-text-primary">
              Add Credits
            </DialogTitle>
            <span className="text-xs text-text-secondary border border-border rounded-btn px-2 py-0.5">
              Demo Mode
            </span>
          </div>
        </DialogHeader>

        <Separator className="bg-border" />

        <div className="py-2 space-y-4">
          <div className="bg-surface-elevated rounded-card p-4 flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">Current balance</p>
              <p className="text-text-secondary text-sm">
                Each generation costs 1 credit
              </p>
            </div>
            <div className="text-right">
              <p className="text-accent font-syne font-bold text-2xl">
                {balance ?? "—"}
              </p>
              <p className="text-text-secondary text-xs">credits</p>
            </div>
          </div>

          <div className="bg-surface-elevated rounded-card p-4 border border-accent/30 flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">Demo Top-Up</p>
              <p className="text-text-secondary text-sm">+5 credits, instant</p>
            </div>
            <p className="text-accent font-syne font-bold text-lg">FREE</p>
          </div>

          <p className="text-xs text-text-secondary text-center">
            In production, credits are purchased via mobile money or card.
            This is a demo placeholder.
          </p>
        </div>

        <Button
          onClick={handleTopUp}
          disabled={topUpLoading}
          className="w-full bg-accent hover:bg-accent/90 text-background font-syne font-semibold rounded-btn h-11"
        >
          {topUpLoading ? "Adding credits..." : "Demo: Add 5 Credits"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
