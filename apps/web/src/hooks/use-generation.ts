"use client";

import { useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";
import type { StylePreset, ApproveResponse, RejectResponse } from "@threadnation/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type GenerationPhase =
  | "idle"
  | "style_select"
  | "generating"
  | "quality_rejected"
  | "preview"
  | "result";

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
  generationId: string;
  status: "success" | "failed" | "quality_rejected";
  inputQualityScore: number;
  criticFeedback?: string;
  generatedAssets?: GeneratedAssets;
  socialContent?: SocialContent;
  creditRefundEligible: boolean;
}

export function useGeneration() {
  const { getToken } = useAuth();
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<StylePreset | null>(null);
  const [progress, setProgress] = useState<ProgressStep | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [highResUrl, setHighResUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setPhase("idle");
    setUploadedFile(null);
    setSelectedPreset(null);
    setProgress(null);
    setResult(null);
    setHighResUrl(null);
    setError(null);
  }, []);

  const selectFile = useCallback((file: File) => {
    setUploadedFile(file);
    setPhase("style_select");
  }, []);

  const generate = useCallback(
    async (preset: StylePreset) => {
      if (!uploadedFile) return;

      setSelectedPreset(preset);
      setPhase("generating");
      setProgress({ step: 1, message: "Starting pipeline...", percent: 5 });
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        // POST multipart
        const formData = new FormData();
        formData.append("image", uploadedFile);
        formData.append("stylePreset", preset);

        const { id } = await apiClient.postFormData<{ id: string }>(
          "/api/v1/generate",
          formData,
          token
        );

        // Stream SSE via fetch (EventSource can't send auth headers)
        abortRef.current = new AbortController();
        const sseToken = await getToken(); // fresh token for stream request
        const sseRes = await fetch(`${API_URL}/api/v1/generate/${id}/progress`, {
          headers: { Authorization: `Bearer ${sseToken}` },
          signal: abortRef.current.signal,
        });

        if (!sseRes.ok || !sseRes.body) {
          throw new Error("Failed to connect to progress stream");
        }

        const reader = sseRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE format: events separated by double newlines
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const chunk of parts) {
            const lines = chunk.split("\n");
            const eventLine = lines.find((l) => l.startsWith("event: "));
            const dataLine = lines.find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            const eventType = eventLine?.slice(7) ?? "message";
            let data: Record<string, unknown>;
            try {
              data = JSON.parse(dataLine.slice(6));
            } catch {
              continue;
            }

            if (eventType === "progress") {
              setProgress({
                step: data.step as number,
                message: data.message as string,
                percent: data.percent as number,
              });
            } else if (eventType === "complete") {
              const completeResult: GenerationResult = {
                generationId: data.generationId as string,
                status: data.status as GenerationResult["status"],
                inputQualityScore: (data.inputQualityScore as number) ?? 0,
                criticFeedback: data.criticFeedback as string | undefined,
                generatedAssets: data.generatedAssets as GeneratedAssets | undefined,
                socialContent: data.socialContent as SocialContent | undefined,
                creditRefundEligible: (data.creditRefundEligible as boolean) ?? true,
              };
              setResult(completeResult);

              if (completeResult.status === "quality_rejected") {
                setPhase("quality_rejected");
              } else if (completeResult.status === "success") {
                setPhase("preview");
              } else {
                setError("Generation failed. Please try again.");
                setPhase("idle");
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message ?? "Something went wrong");
        setPhase("idle");
      }
    },
    [uploadedFile, getToken]
  );

  const approve = useCallback(async () => {
    if (!result) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const data = await apiClient.post<ApproveResponse>(
        `/api/v1/generate/${result.generationId}/approve`,
        {},
        token
      );
      setHighResUrl(data.high_res_url);
      setPhase("result");
      return data;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [result, getToken]);

  const reject = useCallback(async () => {
    if (!result) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const data = await apiClient.post<RejectResponse>(
        `/api/v1/generate/${result.generationId}/reject`,
        {},
        token
      );
      // Return to style_select — user picks a different preset with the same photo
      setSelectedPreset(null);
      setProgress(null);
      setHighResUrl(null);
      setError(null);
      setPhase("style_select");
      return data;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [result, getToken]);

  return {
    phase,
    uploadedFile,
    selectedPreset,
    progress,
    result,
    highResUrl,
    error,
    selectFile,
    setSelectedPreset,
    generate,
    approve,
    reject,
    reset,
  };
}
