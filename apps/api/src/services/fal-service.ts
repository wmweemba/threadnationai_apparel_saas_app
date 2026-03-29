import { fal, type QueueStatus } from "@fal-ai/client";
import { env } from "../lib/env";
import { type StylePreset } from "@threadnation/shared";

fal.config({ credentials: env.FAL_KEY });

const STYLE_PRESET_PROMPTS: Record<StylePreset, string> = {
  studio_clean:
    "professional fashion model wearing {garment}, clean white studio background, professional lighting, high-end fashion photography, sharp focus",
  lusaka_lifestyle:
    "professional fashion model wearing {garment}, modern urban Lusaka cafe background, natural lifestyle lighting, authentic African fashion photography",
  garden_shoot:
    "professional fashion model wearing {garment}, lush tropical garden background, soft natural light, high-end outdoor fashion photography, Zambia",
};

const FAL_MODEL = "fal-ai/flux-pro/v1.1-ultra";
const TIMEOUT_MS = 60_000;

export async function generateImage(
  garmentDescription: string,
  stylePreset: StylePreset
): Promise<{ imageUrl: string; modelUsed: string }> {
  const promptTemplate = STYLE_PRESET_PROMPTS[stylePreset];
  const prompt = promptTemplate.replace("{garment}", garmentDescription);

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Fal.ai generation timed out after 60s")), TIMEOUT_MS)
  );

  const generationPromise = fal.subscribe(FAL_MODEL, {
    input: {
      prompt,
      aspect_ratio: "3:4",   // portrait orientation
      num_images: 1,
      enable_safety_checker: true,
      output_format: "jpeg",
    },
    onQueueUpdate: (update: QueueStatus) => {
      if (update.status === "IN_QUEUE") {
        const pos = (update as { position?: number }).position;
        console.log(`[fal-service] queued${pos != null ? ` — position ${pos}` : ""}`);
      } else if (update.status === "IN_PROGRESS") {
        console.log("[fal-service] in progress");
      }
    },
  });

  const result = await Promise.race([generationPromise, timeoutPromise]);

  const images = result.data.images;
  if (!images || images.length === 0) {
    throw new Error("Fal.ai returned no images");
  }

  return {
    imageUrl: images[0].url,
    modelUsed: FAL_MODEL,
  };
}
