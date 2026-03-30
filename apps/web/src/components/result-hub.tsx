"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CaptionPanel } from "./caption-panel";
import type { SocialContent } from "@/hooks/use-generation";
import { useToast } from "@/hooks/use-toast";

interface ResultHubProps {
  highResUrl: string;
  socialContent: SocialContent;
  onGenerateAnother: () => void;
}

export function ResultHub({
  highResUrl,
  socialContent,
  onGenerateAnother,
}: ResultHubProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const shareToWhatsApp = () => {
    const caption =
      socialContent.local_vibe_caption +
      "\n\n" +
      socialContent.hashtags.join(" ");
    const text = encodeURIComponent(caption);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast({
      title: "WhatsApp opened",
      description: "Attach your saved image in the WhatsApp chat.",
    });
  };

  const saveToGallery = async () => {
    setSaving(true);
    try {
      if (navigator.share) {
        const res = await fetch(highResUrl);
        const blob = await res.blob();
        const file = new File([blob], `threadnation-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        await navigator.share({ files: [file], title: "ThreadNation AI" });
      } else {
        const a = document.createElement("a");
        a.href = highResUrl;
        a.download = `threadnation-${Date.now()}.jpg`;
        a.target = "_blank";
        a.click();
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast({ title: "Download failed", variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* High-res image */}
      <div className="relative rounded-card overflow-hidden bg-surface-elevated aspect-[3/4] max-h-[480px]">
        <Image
          src={highResUrl}
          alt="High-resolution result"
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-success/80 text-white text-xs px-2 py-1 rounded-btn">
            ✓ High Resolution
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={saveToGallery}
          disabled={saving}
          variant="outline"
          className="border-border text-text-primary hover:border-accent rounded-btn h-11"
        >
          {saving ? "Saving..." : "Save to Gallery"}
        </Button>
        <Button
          onClick={shareToWhatsApp}
          className="bg-[#25D366] hover:bg-[#1eb854] text-white font-syne font-semibold rounded-btn h-11"
        >
          Share to WhatsApp 📲
        </Button>
      </div>

      {/* Captions */}
      <CaptionPanel socialContent={socialContent} />

      <Button
        onClick={onGenerateAnother}
        variant="outline"
        className="w-full border-border text-text-secondary hover:text-text-primary rounded-btn h-10"
      >
        Generate Another
      </Button>
    </div>
  );
}
