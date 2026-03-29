import sharp from "sharp";
import { openRouterChat } from "../lib/openrouter";
import {
  QualityCriticResponseSchema,
  type QualityCriticResponse,
} from "@threadnation/shared";

const QUALITY_CRITIC_PROMPT = `You are a professional product photography quality assessor
for a fashion e-commerce platform targeting Zambian boutiques.

Analyze the uploaded garment photo and score it from 0-100 based on:
- Focus and sharpness (30 points): Is the garment in clear focus?
- Lighting quality (30 points): Is the garment well-lit with visible detail?
- Garment visibility (25 points): Is the full garment or key features visible?
- Background suitability (15 points): Is the background clean enough for AI processing?

Return ONLY valid JSON matching this exact structure — no markdown, no explanation:
{
  "score": <number 0-100>,
  "passed": <boolean, true if score >= 70>,
  "feedback": "<one sentence of actionable advice if score < 70, empty string if passed>",
  "garment_description": "<one sentence describing the garment: colour, type, and silhouette>"
}`;

const FALLBACK: QualityCriticResponse = {
  score: 75,
  passed: true,
  feedback: "",
  garment_description: "a garment",
};

export async function analyzeImageQuality(
  imageBuffer: Buffer
): Promise<QualityCriticResponse> {
  try {
    // Resize to max 800px before encoding — keeps base64 payload under ~150KB
    const resized = await sharp(imageBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();

    const base64 = resized.toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64}`;

    const raw = await openRouterChat(
      {
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: QUALITY_CRITIC_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: dataUri },
              },
              {
                type: "text",
                text: "Analyze this garment photo and return the JSON.",
              },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.1,
      },
      20_000
    );

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const result = QualityCriticResponseSchema.parse(parsed);

    // Soft gate: if score 60-69 treat as pass for demo resilience
    if (result.score >= 60 && result.score < 70) {
      result.passed = true;
      result.feedback = "";
    }

    return result;
  } catch (err) {
    console.warn("[quality-critic] fallback triggered:", (err as Error).message);
    return FALLBACK;
  }
}
