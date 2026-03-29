// Generation pipeline state machine states
export type GenerationStatus =
  | "idle"
  | "quality_check"
  | "style_select"
  | "quality_rejected"
  | "generating"
  | "preview"
  | "result";

export type StylePreset =
  | "studio_clean"
  | "lusaka_lifestyle"
  | "garden_shoot";

export interface ProgressStep {
  step: number;
  message: string;
  percent: number;
}

export interface GeneratedAssets {
  preview_url: string;
  high_res_url?: string;
  model_used: string;
}

export interface SocialContent {
  sales_caption: string;
  lifestyle_caption: string;
  local_vibe_caption: string;
  hashtags: string[];
}

export interface GenerationResult {
  id: string;
  status: "success" | "failed" | "quality_rejected";
  input_quality_score: number;
  critic_feedback?: string;
  generated_assets?: GeneratedAssets;
  social_content?: SocialContent;
  computational_cost_usd: number;
  credit_refund_eligible: boolean;
}

export interface GenerationState {
  status: GenerationStatus;
  result: GenerationResult | null;
  qualityScore: number | null;
  selectedPreset: StylePreset | null;
  uploadedFile: File | null;
  error: string | null;
}

export interface CreditState {
  balance: number | null;
  isLoading: boolean;
  topUpLoading: boolean;
}
