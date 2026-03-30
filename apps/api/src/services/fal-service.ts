import { env } from "../lib/env";
import { type StylePreset } from "@threadnation/shared";

// NOTE: This file keeps its name for import compatibility.
// Provider switched from fal.ai → HuggingFace Inference API (free tier).
// Switch back: change HF_MODEL, HF_API_URL, and the fetch call below.

const HF_MODEL = "black-forest-labs/FLUX.1-schnell";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;
const TIMEOUT_MS = 120_000; // 2 min — HF free tier cold-starts can be slow
const MAX_ATTEMPTS = 3;

const STYLE_PRESET_PROMPTS: Record<StylePreset, string> = {
  studio_clean:
    "professional fashion model wearing {garment}, clean white studio background, professional lighting, high-end fashion photography, sharp focus",
  lusaka_lifestyle:
    "professional fashion model wearing {garment}, modern urban Lusaka cafe background, natural lifestyle lighting, authentic African fashion photography",
  garden_shoot:
    "professional fashion model wearing {garment}, lush tropical garden background, soft natural light, high-end outdoor fashion photography, Zambia",
};

export async function generateImage(
  garmentDescription: string,
  stylePreset: StylePreset
): Promise<{ imageBuffer: Buffer; modelUsed: string }> {
  const prompt = STYLE_PRESET_PROMPTS[stylePreset].replace(
    "{garment}",
    garmentDescription
  );

  console.log(
    `[hf-service] generating | model: ${HF_MODEL} | preset: ${stylePreset}`
  );

  let lastError: Error = new Error("Unknown error");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true", // ask HF to wait instead of returning 503
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            height: 1024,
            width: 768,
            num_inference_steps: 4,
            guidance_scale: 0.0,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Model still loading — wait the estimated time then retry
      if (response.status === 503) {
        const body = (await response.json().catch(() => ({}))) as {
          estimated_time?: number;
        };
        const waitMs = Math.min((body.estimated_time ?? 20) * 1000, 30_000);
        console.log(
          `[hf-service] model loading, waiting ${Math.round(waitMs / 1000)}s (attempt ${attempt}/${MAX_ATTEMPTS})`
        );
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`HuggingFace ${response.status}: ${text.slice(0, 200)}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      console.log(
        `[hf-service] done | buffer: ${(imageBuffer.length / 1024).toFixed(0)} KB`
      );

      return { imageBuffer, modelUsed: HF_MODEL };
    } catch (err) {
      clearTimeout(timer);
      lastError = err as Error;

      if ((err as Error).name === "AbortError") {
        lastError = new Error(`HuggingFace timed out after ${TIMEOUT_MS / 1000}s`);
      }

      console.error(
        `[hf-service] attempt ${attempt} failed:`,
        lastError.message
      );

      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 5_000));
      }
    }
  }

  throw lastError;
}
