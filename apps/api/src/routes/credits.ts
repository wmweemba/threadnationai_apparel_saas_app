import { Router, Request, Response } from "express";
import { requireUser } from "../middleware/auth";
import { User } from "../models/user.model";
import { env } from "../lib/env";

const router = Router();

/**
 * GET /api/v1/credits
 * Returns current credit balance and DPA consent status.
 */
router.get("/", requireUser, (req: Request, res: Response) => {
  const user = req.dbUser!;
  res.json({
    credits: user.credits,
    dpa_consent_signed: user.dpaConsentSigned,
  });
});

/**
 * POST /api/v1/credits/topup
 * Mock top-up: adds CREDITS_PER_TOPUP credits instantly (no payment, hackathon demo).
 */
router.post("/topup", requireUser, async (req: Request, res: Response) => {
  const user = req.dbUser!;
  const added = env.CREDITS_PER_TOPUP;

  const updated = await User.findByIdAndUpdate(
    user._id,
    { $inc: { credits: added } },
    { new: true }
  );

  res.json({
    credits_remaining: updated?.credits ?? user.credits + added,
    credits_added: added,
  });
});

/**
 * PATCH /api/v1/credits/consent
 * Records DPA consent for the authenticated user.
 */
router.patch("/consent", requireUser, async (req: Request, res: Response) => {
  const user = req.dbUser!;

  await User.findByIdAndUpdate(user._id, {
    $set: {
      dpaConsentSigned: true,
      dpaConsentDate: new Date(),
    },
  });

  res.json({ success: true });
});

export default router;
