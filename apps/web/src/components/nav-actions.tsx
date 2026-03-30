"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { CreditBadge } from "./credit-badge";
import { MockTopupModal } from "./mock-topup-modal";

export function NavActions() {
  const [topupOpen, setTopupOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <CreditBadge onTopUpClick={() => setTopupOpen(true)} />
      <UserButton
        appearance={{
          elements: { avatarBox: "w-8 h-8" },
        }}
      />
      <MockTopupModal open={topupOpen} onClose={() => setTopupOpen(false)} />
    </div>
  );
}
