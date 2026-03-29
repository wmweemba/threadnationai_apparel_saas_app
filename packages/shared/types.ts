import { z } from "zod";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const StylePresetEnum = z.enum([
  "studio_clean",
  "lusaka_lifestyle",
  "garden_shoot",
]);
export type StylePreset = z.infer<typeof StylePresetEnum>;

export const GenerationStatusEnum = z.enum([
  "success",
  "failed",
  "quality_rejected",
]);
export type GenerationStatus = z.infer<typeof GenerationStatusEnum>;

// ── Agent responses ───────────────────────────────────────────────────────────

export const QualityCriticResponseSchema = z.object({
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  feedback: z.string(),
  garment_description: z.string(),
});
export type QualityCriticResponse = z.infer<typeof QualityCriticResponseSchema>;

export const CaptionResponseSchema = z.object({
  sales_caption: z.string(),
  lifestyle_caption: z.string(),
  local_vibe_caption: z.string(),
  hashtags: z.array(z.string()),
});
export type CaptionResponse = z.infer<typeof CaptionResponseSchema>;

// ── API request/response schemas ──────────────────────────────────────────────

export const GenerateRequestSchema = z.object({
  stylePreset: StylePresetEnum,
});

export const GeneratedAssetsSchema = z.object({
  preview_url: z.string().url(),
  high_res_url: z.string().url().optional(),
  model_used: z.string(),
});

export const SocialContentSchema = z.object({
  sales_caption: z.string(),
  lifestyle_caption: z.string(),
  local_vibe_caption: z.string(),
  hashtags: z.array(z.string()),
});

export const GenerateResponseSchema = z.object({
  id: z.string(),
  status: GenerationStatusEnum,
  input_quality_score: z.number().min(0).max(100),
  critic_feedback: z.string().optional(),
  generated_assets: GeneratedAssetsSchema.optional(),
  social_content: SocialContentSchema.optional(),
  computational_cost_usd: z.number(),
  credit_refund_eligible: z.boolean(),
});
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

export const ApproveResponseSchema = z.object({
  high_res_url: z.string().url(),
  credits_remaining: z.number(),
});
export type ApproveResponse = z.infer<typeof ApproveResponseSchema>;

export const RejectResponseSchema = z.object({
  credits_remaining: z.number(),
  rejections_this_hour: z.number(),
});
export type RejectResponse = z.infer<typeof RejectResponseSchema>;

export const CreditsResponseSchema = z.object({
  credits: z.number(),
  dpa_consent_signed: z.boolean(),
});
export type CreditsResponse = z.infer<typeof CreditsResponseSchema>;

export const TopupResponseSchema = z.object({
  credits_remaining: z.number(),
  credits_added: z.number(),
});
export type TopupResponse = z.infer<typeof TopupResponseSchema>;

// ── History ───────────────────────────────────────────────────────────────────

export const GenerationSummarySchema = z.object({
  id: z.string(),
  status: GenerationStatusEnum,
  stylePreset: StylePresetEnum,
  inputQualityScore: z.number(),
  previewUrl: z.string().url().optional(),
  approved: z.boolean(),
  createdAt: z.string(),
});
export type GenerationSummary = z.infer<typeof GenerationSummarySchema>;

export const HistoryResponseSchema = z.object({
  generations: z.array(GenerationSummarySchema),
});
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;

// ── SSE progress events ───────────────────────────────────────────────────────

export const ProgressEventSchema = z.object({
  step: z.number().min(1).max(5),
  message: z.string(),
  percent: z.number().min(0).max(100),
});
export type ProgressEvent = z.infer<typeof ProgressEventSchema>;

export const CompleteEventSchema = z.object({
  generationId: z.string(),
  status: GenerationStatusEnum,
});
export type CompleteEvent = z.infer<typeof CompleteEventSchema>;

// ── SSE progress step definitions ────────────────────────────────────────────

export const PROGRESS_STEPS: ProgressEvent[] = [
  { step: 1, message: "Analyzing fabric details...", percent: 10 },
  { step: 2, message: "Checking image quality...", percent: 25 },
  {
    step: 3,
    message: "Placing model in selected setting...",
    percent: 40,
  },
  { step: 4, message: "Generating studio-quality image...", percent: 65 },
  { step: 5, message: "Crafting high-converting captions...", percent: 85 },
];
