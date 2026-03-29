import mongoose, { Document, Schema } from "mongoose";

export type GenerationStatus = "success" | "failed" | "quality_rejected";
export type StylePreset = "studio_clean" | "lusaka_lifestyle" | "garden_shoot";

export interface IGeneration extends Document {
  id: string;
  userId: string;
  status: GenerationStatus;
  stylePreset: StylePreset;
  inputQualityScore: number;
  criticFeedback?: string;
  previewUrl?: string;
  highResUrl?: string; // NEVER returned until approved
  modelUsed: string;
  salesCaption?: string;
  lifestyleCaption?: string;
  localVibeCaption?: string;
  hashtags?: string[];
  creditDeducted: boolean;
  approved: boolean;
  computationalCostUsd: number;
  creditRefundEligible: boolean;
  createdAt: Date;
}

const GenerationSchema = new Schema<IGeneration>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "quality_rejected"],
      required: true,
    },
    stylePreset: {
      type: String,
      enum: ["studio_clean", "lusaka_lifestyle", "garden_shoot"],
      required: true,
    },
    inputQualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    criticFeedback: {
      type: String,
    },
    previewUrl: {
      type: String,
    },
    // highResUrl is intentionally restricted — never returned to client until approved
    highResUrl: {
      type: String,
      select: false, // excluded from default queries
    },
    modelUsed: {
      type: String,
      default: "",
    },
    salesCaption: {
      type: String,
    },
    lifestyleCaption: {
      type: String,
    },
    localVibeCaption: {
      type: String,
    },
    hashtags: {
      type: [String],
      default: undefined,
    },
    creditDeducted: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    computationalCostUsd: {
      type: Number,
      default: 0,
    },
    creditRefundEligible: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

GenerationSchema.index({ userId: 1, createdAt: -1 });

export const Generation =
  mongoose.models.Generation ??
  mongoose.model<IGeneration>("Generation", GenerationSchema);
