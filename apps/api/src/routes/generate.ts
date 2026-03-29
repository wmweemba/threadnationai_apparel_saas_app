import { Router, Request, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { requireUser } from "../middleware/auth";
import { generateLimiter, rejectionLimiter } from "../middleware/rate-limit";
import { analyzeImageQuality } from "../agents/quality-critic";
import { generateCaptions } from "../agents/caption-agent";
import { generateImage } from "../services/fal-service";
import { createWatermarkedPreview } from "../services/watermark-service";
import { uploadBuffer, uploadFromUrl } from "../services/storage-service";
import { Generation } from "../models/generation.model";
import { User } from "../models/user.model";
import {
  StylePresetEnum,
  PROGRESS_STEPS,
  type StylePreset,
} from "@threadnation/shared";
import { env } from "../lib/env";

const router = Router();

// ── Multer ────────────────────────────────────────────────────────────────────

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG and WebP images are allowed"));
    }
  },
});

/** Magic-byte server-side MIME verification */
function verifyMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const webp =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;
  return jpeg || png || webp;
}

// ── In-memory SSE job store ───────────────────────────────────────────────────

interface SSEProgressEvent {
  step: number;
  message: string;
  percent: number;
}

interface SSECompleteEvent {
  generationId: string;
  status: string;
  inputQualityScore?: number;
  criticFeedback?: string;
  generatedAssets?: { preview_url: string; model_used: string };
  socialContent?: {
    sales_caption: string;
    lifestyle_caption: string;
    local_vibe_caption: string;
    hashtags: string[];
  };
}

interface JobState {
  userId: string;
  progressEvents: SSEProgressEvent[];
  completed: boolean;
  completionData?: SSECompleteEvent;
  clients: Set<Response>;
}

const jobs = new Map<string, JobState>();

function emitProgress(job: JobState, event: SSEProgressEvent) {
  job.progressEvents.push(event);
  const payload = `event: progress\ndata: ${JSON.stringify(event)}\n\n`;
  for (const client of job.clients) {
    client.write(payload);
  }
}

function emitComplete(job: JobState, data: SSECompleteEvent) {
  job.completed = true;
  job.completionData = data;
  const payload = `event: complete\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of job.clients) {
    client.write(payload);
    client.end();
  }
}

// ── Generation pipeline ───────────────────────────────────────────────────────

async function runPipeline(
  jobId: string,
  clerkId: string,
  imageBuffer: Buffer,
  stylePreset: StylePreset
) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    // Step 1 — Analyzing fabric details
    emitProgress(job, PROGRESS_STEPS[0]);

    // Step 2 — Quality check
    emitProgress(job, PROGRESS_STEPS[1]);
    const quality = await analyzeImageQuality(imageBuffer);

    if (!quality.passed) {
      await Generation.create({
        id: jobId,
        userId: clerkId,
        status: "quality_rejected",
        stylePreset,
        inputQualityScore: quality.score,
        criticFeedback: quality.feedback,
        modelUsed: "google/gemini-2.0-flash-exp",
        creditDeducted: false,
        approved: false,
        computationalCostUsd: 0,
        creditRefundEligible: false,
      });

      emitComplete(job, {
        generationId: jobId,
        status: "quality_rejected",
        inputQualityScore: quality.score,
        criticFeedback: quality.feedback,
      });

      scheduleCleanup(jobId);
      return;
    }

    const garmentDescription = quality.garment_description;

    // Step 3 — Placing model in setting
    emitProgress(job, PROGRESS_STEPS[2]);
    const { imageUrl, modelUsed } = await generateImage(garmentDescription, stylePreset);

    // Step 4 — Generating studio image (fetch + watermark + upload)
    emitProgress(job, PROGRESS_STEPS[3]);

    const falResponse = await fetch(imageUrl);
    if (!falResponse.ok) {
      throw new Error(`Failed to fetch Fal image: ${falResponse.status}`);
    }
    const falBuffer = Buffer.from(await falResponse.arrayBuffer());

    const watermarkedBuffer = await createWatermarkedPreview(falBuffer);
    const [previewUrl, highResUrl] = await Promise.all([
      uploadBuffer(watermarkedBuffer, "threadnation/previews", `${jobId}_preview`),
      uploadFromUrl(imageUrl, "threadnation/highres", `${jobId}_highres`),
    ]);

    // Step 5 — Captions
    emitProgress(job, PROGRESS_STEPS[4]);
    const captions = await generateCaptions(garmentDescription, stylePreset);

    // Persist generation record
    await Generation.create({
      id: jobId,
      userId: clerkId,
      status: "success",
      stylePreset,
      inputQualityScore: quality.score,
      previewUrl,
      highResUrl,
      modelUsed,
      salesCaption: captions.sales_caption,
      lifestyleCaption: captions.lifestyle_caption,
      localVibeCaption: captions.local_vibe_caption,
      hashtags: captions.hashtags,
      creditDeducted: false,
      approved: false,
      computationalCostUsd: 0.04,
      creditRefundEligible: true,
    });

    emitComplete(job, {
      generationId: jobId,
      status: "success",
      inputQualityScore: quality.score,
      generatedAssets: { preview_url: previewUrl, model_used: modelUsed },
      socialContent: {
        sales_caption: captions.sales_caption,
        lifestyle_caption: captions.lifestyle_caption,
        local_vibe_caption: captions.local_vibe_caption,
        hashtags: captions.hashtags,
      },
    });
  } catch (err) {
    console.error("[pipeline] error for job", jobId, (err as Error).message);

    // Attempt to persist failure record (best-effort)
    try {
      await Generation.create({
        id: jobId,
        userId: clerkId,
        status: "failed",
        stylePreset,
        inputQualityScore: 0,
        modelUsed: "unknown",
        creditDeducted: false,
        approved: false,
        computationalCostUsd: 0,
        creditRefundEligible: false,
      });
    } catch {
      // ignore secondary error
    }

    emitComplete(job, { generationId: jobId, status: "failed" });
  } finally {
    scheduleCleanup(jobId);
  }
}

function scheduleCleanup(jobId: string) {
  setTimeout(() => jobs.delete(jobId), 5 * 60 * 1000);
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/generate
 * Validates upload, fires off background pipeline, returns 202 { id }
 */
router.post(
  "/",
  requireUser,
  generateLimiter,
  upload.single("image"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "Image file is required" });
      return;
    }

    // Server-side magic bytes check
    if (!verifyMagicBytes(req.file.buffer)) {
      res.status(400).json({ error: "Invalid image format" });
      return;
    }

    // Validate stylePreset
    const parsed = z.object({ stylePreset: StylePresetEnum }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid stylePreset",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { stylePreset } = parsed.data;
    const user = req.dbUser!;

    if (!user.dpaConsentSigned) {
      res.status(403).json({ error: "DPA consent required before generating" });
      return;
    }

    if (user.credits < 1) {
      res.status(402).json({ error: "Insufficient credits" });
      return;
    }

    const jobId = uuidv4();

    // Register job before starting pipeline
    jobs.set(jobId, {
      userId: user.clerkId,
      progressEvents: [],
      completed: false,
      clients: new Set(),
    });

    // Copy buffer before clearing the reference
    const imageCopy = Buffer.from(req.file.buffer);
    // Clear original reference to free memory
    req.file.buffer = Buffer.alloc(0);

    // Fire-and-forget
    runPipeline(jobId, user.clerkId, imageCopy, stylePreset).catch((err) => {
      console.error("[pipeline] unhandled rejection:", err);
    });

    res.status(202).json({ id: jobId });
  }
);

/**
 * GET /api/v1/generate/:id/progress
 * SSE stream — replays buffered events then streams live updates
 */
router.get("/:id/progress", requireUser, (req: Request, res: Response) => {
  const id = req.params.id as string;
  const clerkId = req.dbUser!.clerkId;

  const job = jobs.get(id);
  if (!job) {
    res.status(404).json({ error: "Generation job not found" });
    return;
  }

  if (job.userId !== clerkId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // nginx: disable proxy buffering
  res.flushHeaders();

  // Replay buffered progress events
  for (const event of job.progressEvents) {
    res.write(`event: progress\ndata: ${JSON.stringify(event)}\n\n`);
  }

  // If already done, send complete and close
  if (job.completed && job.completionData) {
    res.write(`event: complete\ndata: ${JSON.stringify(job.completionData)}\n\n`);
    res.end();
    return;
  }

  // Subscribe for live events
  job.clients.add(res);

  req.on("close", () => {
    job.clients.delete(res);
  });
});

/**
 * POST /api/v1/generate/:id/approve
 * Deducts 1 credit, returns high-res URL
 */
router.post("/:id/approve", requireUser, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = req.dbUser!;

  const generation = await Generation.findOne({
    id,
    userId: user.clerkId,
    status: "success",
    approved: false,
  });

  if (!generation) {
    res.status(404).json({ error: "Generation not found or already approved" });
    return;
  }

  if (user.credits < 1) {
    res.status(402).json({ error: "Insufficient credits" });
    return;
  }

  // Deduct credit
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $inc: { credits: -1 } },
    { new: true }
  );

  // Mark approved
  generation.approved = true;
  generation.creditDeducted = true;
  await generation.save();

  // Fetch highResUrl (select: false field)
  const withHighRes = await Generation.findOne({ id }).select("+highResUrl");

  res.json({
    high_res_url: withHighRes?.highResUrl ?? "",
    credits_remaining: updatedUser?.credits ?? 0,
  });
});

/**
 * POST /api/v1/generate/:id/reject
 * Refunds 0.5 credits (max 3/hour)
 */
router.post(
  "/:id/reject",
  requireUser,
  rejectionLimiter,
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.dbUser!;

    const generation = await Generation.findOne({
      id,
      userId: user.clerkId,
      status: "success",
      approved: false,
      creditRefundEligible: true,
    });

    if (!generation) {
      res.status(404).json({ error: "Generation not found or not eligible for refund" });
      return;
    }

    // Reset rejection window if it expired
    const now = new Date();
    const windowStart = user.rejectionsWindowStart;
    const windowExpired =
      !windowStart ||
      now.getTime() - windowStart.getTime() > 60 * 60 * 1000;

    if (windowExpired) {
      user.rejectionsThisHour = 0;
      user.rejectionsWindowStart = now;
    }

    if (user.rejectionsThisHour >= env.REJECTION_HOURLY_LIMIT) {
      res.status(429).json({ error: "Rejection limit reached for this hour" });
      return;
    }

    // Refund 0.5 credits and track rejection
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: { credits: 0.5, rejectionsThisHour: 1 },
        $set: windowExpired ? { rejectionsWindowStart: now } : {},
      },
      { new: true }
    );

    // Mark generation as no longer refund-eligible
    generation.creditRefundEligible = false;
    await generation.save();

    res.json({
      credits_remaining: updatedUser?.credits ?? 0,
      rejections_this_hour: updatedUser?.rejectionsThisHour ?? 1,
    });
  }
);

export default router;
