import { env } from "./env";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{
        type: "text" | "image_url";
        text?: string;
        image_url?: { url: string };
      }>;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function openRouterChat(
  request: OpenRouterRequest,
  timeoutMs = 30000
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": env.FRONTEND_URL,
          "X-Title": "ThreadNation AI",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `OpenRouter API error ${response.status}: ${text.slice(0, 200)}`
      );
    }

    const data = (await response.json()) as OpenRouterResponse;
    return data.choices[0]?.message?.content ?? "";
  } finally {
    clearTimeout(timeout);
  }
}
