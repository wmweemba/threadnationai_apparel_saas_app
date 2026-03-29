import { openRouterChat } from "../lib/openrouter";
import {
  CaptionResponseSchema,
  type CaptionResponse,
} from "@threadnation/shared";

const buildCaptionPrompt = (
  garmentDescription: string,
  stylePreset: string
): string => `
You are the "Head of Social Growth" for ThreadNation AI. Write high-converting social media
captions for a Zambian fashion boutique. The style preset used was: ${stylePreset}.

Garment details from visual analysis: ${garmentDescription}

STYLE RULES:
- Blend standard English with Zambian business etiquette
- Use phrases like "DM for price", "Serious buyers only", "Nationwide delivery"
- Use emojis strategically (👗 ✨ 📍 📲) but sparingly
- The local vibe option should use subtle Nyanja/Bemba warmth (e.g. "muoneke bwino", "fasho", "pache")

Return ONLY valid JSON — no markdown, no preamble:
{
  "sales_caption": "<THE HUSTLER: short, punchy, price-focused, strong CTA>",
  "lifestyle_caption": "<THE STORYTELLER: quality and occasion focused>",
  "local_vibe_caption": "<THE LUSAKA VIBE: warm, local slang infused>",
  "hashtags": ["<array of 6-8 relevant hashtags, mix English and Zambian>"]
}`;

const FALLBACK_CAPTIONS: CaptionResponse = {
  sales_caption:
    "✨ Fresh stock just landed! 👗 DM for price. Serious buyers only. Nationwide delivery available. 📲",
  lifestyle_caption:
    "Elegance meets everyday comfort. This piece was made for the woman who means business. Quality you can feel. ✨",
  local_vibe_caption:
    "Muoneke bwino muli umu outfit! 👗 Fasho quality, fasho price. DM us pache. Nationwide delivery. 📍 #LusakaFashion",
  hashtags: [
    "#ZambianFashion",
    "#LusakaStyle",
    "#AfricanFashion",
    "#ThreadNationAI",
    "#ZambianBoutique",
    "#FashionZambia",
    "#StyleZambia",
    "#ZambiaFashion",
  ],
};

export async function generateCaptions(
  garmentDescription: string,
  stylePreset: string
): Promise<CaptionResponse> {
  try {
    const raw = await openRouterChat(
      {
        model: "google/gemma-3-27b-it:free",
        messages: [
          {
            role: "user",
            content: buildCaptionPrompt(garmentDescription, stylePreset),
          },
        ],
        max_tokens: 600,
        temperature: 0.7,
      },
      15_000
    );

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return CaptionResponseSchema.parse(parsed);
  } catch (err) {
    console.warn("[caption-agent] fallback triggered:", (err as Error).message);
    return FALLBACK_CAPTIONS;
  }
}
