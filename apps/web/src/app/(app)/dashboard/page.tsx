"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGeneration } from "@/hooks/use-generation";
import { useCredits } from "@/hooks/use-credits";
import { ConsentGate } from "@/components/consent-gate";
import { UploadZone } from "@/components/upload-zone";
import { StyleSelector } from "@/components/style-selector";
import { ProgressFeed } from "@/components/progress-feed";
import { PreviewCard } from "@/components/preview-card";
import { CaptionPanel } from "@/components/caption-panel";
import { ResultHub } from "@/components/result-hub";
import { MockTopupModal } from "@/components/mock-topup-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { StylePreset } from "@threadnation/shared";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
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
  } = useGeneration();

  const {
    balance,
    dpaConsentSigned,
    isLoading: creditsLoading,
    recordConsent,
    refetch: refetchCredits,
  } = useCredits();

  const [topupOpen, setTopupOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("r") === "1") {
      reset();
      router.replace("/dashboard");
    }
  }, [searchParams]);

  const handleApprove = async () => {
    await approve();
    refetchCredits();
  };

  const handleReject = async () => {
    await reject();
    refetchCredits();
    toast({ title: "0.5 credits refunded", description: "Pick a different style and try again." });
  };

  const handleGenerate = () => {
    if (!selectedPreset) return;
    if (balance !== null && balance < 1) {
      setTopupOpen(true);
      return;
    }
    generate(selectedPreset);
  };

  const titles: Record<string, { title: string; subtitle: string }> = {
    idle: {
      title: "Create Your Post",
      subtitle:
        "Upload a photo of your garment to generate a studio-quality social media post.",
    },
    style_select: {
      title: "Choose Your Style",
      subtitle: "Pick the visual setting that best suits your brand.",
    },
    generating: {
      title: "Generating...",
      subtitle: "Your studio shot is being crafted. This takes ~15–30 seconds.",
    },
    quality_rejected: {
      title: "Photo Needs Improvement",
      subtitle: "Retake with better lighting or focus and try again.",
    },
    preview: {
      title: "Your Preview is Ready",
      subtitle:
        "Unlock full resolution when you're happy, or reject for 0.5 credits back.",
    },
    result: {
      title: "All Done!",
      subtitle: "Your studio-quality image and captions are ready to share.",
    },
  };

  const { title, subtitle } = titles[phase] ?? titles.idle;

  if (creditsLoading) {
    return (
      <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-64 bg-surface-elevated" />
        <Skeleton className="h-5 w-96 bg-surface-elevated" />
        <Skeleton className="h-64 w-full rounded-card bg-surface-elevated" />
      </div>
    );
  }

  return (
    <>
      <ConsentGate open={!dpaConsentSigned} onAccept={recordConsent} />

      <MockTopupModal open={topupOpen} onClose={() => setTopupOpen(false)} />

      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-syne font-extrabold text-text-primary mb-2">
            {title}
          </h1>
          <p className="text-warm-dim">{subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 bg-error/10 border border-error/30 rounded-card px-4 py-3 text-error text-sm">
            {error}
          </div>
        )}

        {/* ── idle ────────────────────────────────────────────── */}
        {phase === "idle" && <UploadZone onFileSelected={selectFile} />}

        {/* ── style_select ─────────────────────────────────────── */}
        {phase === "style_select" && (
          <div className="space-y-6">
            {uploadedFile && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={URL.createObjectURL(uploadedFile)}
                alt="Uploaded garment"
                className="w-full max-h-48 object-cover rounded-card border border-[rgba(255,255,255,0.08)]"
              />
            )}
            <StyleSelector
              qualityScore={result?.inputQualityScore ?? 100}
              selected={selectedPreset}
              onSelect={(preset: StylePreset) => setSelectedPreset(preset)}
              onGenerate={handleGenerate}
            />
          </div>
        )}

        {/* ── generating ───────────────────────────────────────── */}
        {phase === "generating" && <ProgressFeed current={progress} />}

        {/* ── quality_rejected ─────────────────────────────────── */}
        {phase === "quality_rejected" && result && (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-error/10 border border-error/30 rounded-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-error/20 rounded-btn px-3 py-1.5">
                  <span className="text-error text-sm font-medium">
                    Score: {result.inputQualityScore}/100
                  </span>
                </div>
              </div>
              {result.criticFeedback && (
                <p className="text-warm-dim text-sm">
                  {result.criticFeedback}
                </p>
              )}
            </div>

            <div className="bg-surface-card rounded-card border border-[rgba(255,255,255,0.08)] p-5 space-y-3">
              <p className="font-syne font-bold text-text-primary text-sm">
                Tips for a better shot:
              </p>
              <ul className="space-y-2 text-sm text-warm-dim">
                {[
                  "Natural light from a window works best",
                  "Place the garment flat or hang it up",
                  "Use a plain wall or clean background",
                  "Ensure the full garment is in the frame",
                ].map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="text-kente-gold">✦</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={reset}
              className="w-full bg-kente-gold hover:bg-kente-gold/90 text-midnight font-syne font-bold rounded-btn h-11 transition-colors"
            >
              Retake Photo
            </button>
          </div>
        )}

        {/* ── preview ──────────────────────────────────────────── */}
        {phase === "preview" && result?.generatedAssets && (
          <div className="space-y-6">
            <PreviewCard
              previewUrl={result.generatedAssets.preview_url}
              creditRefundEligible={result.creditRefundEligible}
              onApprove={handleApprove}
              onReject={handleReject}
            />
            {result.socialContent && (
              <CaptionPanel socialContent={result.socialContent} />
            )}
          </div>
        )}

        {/* ── result ───────────────────────────────────────────── */}
        {phase === "result" && highResUrl && result?.socialContent && (
          <ResultHub
            highResUrl={highResUrl}
            socialContent={result.socialContent}
            onGenerateAnother={reset}
          />
        )}
      </div>
    </>
  );
}
