"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { CreditBadge } from "./credit-badge";
import { MockTopupModal } from "./mock-topup-modal";

export function NavActions() {
  const [topupOpen, setTopupOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <CreditBadge onTopUpClick={() => setTopupOpen(true)} />
      <div className="relative z-50">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-7 h-7 sm:w-8 sm:h-8",
              userButtonPopoverCard:
                "!bg-[#1A1209] !border !border-[rgba(255,255,255,0.12)] !shadow-2xl",
              userButtonPopoverActionButton:
                "!text-[#F5F0E8] hover:!bg-[#241C10]",
              userButtonPopoverActionButtonText: "!text-[#F5F0E8]",
              userButtonPopoverActionButtonIcon: "!text-[#9A8A72]",
              userButtonPopoverFooter: "!hidden",
            },
          }}
        />
      </div>
      <MockTopupModal open={topupOpen} onClose={() => setTopupOpen(false)} />
    </div>
  );
}
