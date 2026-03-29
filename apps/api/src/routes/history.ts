import { Router, Request, Response } from "express";
import { requireUser } from "../middleware/auth";
import { Generation } from "../models/generation.model";

const router = Router();

/**
 * GET /api/v1/history
 * Returns the last 5 generations for the authenticated user.
 * highResUrl is never included (select: false + excluded here).
 */
router.get("/", requireUser, async (req: Request, res: Response) => {
  const clerkId = req.dbUser!.clerkId;

  const generations = await Generation.find({ userId: clerkId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("-highResUrl -__v")
    .lean();

  const summaries = generations.map((g) => ({
    id: g.id,
    status: g.status,
    stylePreset: g.stylePreset,
    inputQualityScore: g.inputQualityScore,
    previewUrl: g.previewUrl,
    approved: g.approved,
    createdAt: (g.createdAt as Date).toISOString(),
  }));

  res.json({ generations: summaries });
});

export default router;
