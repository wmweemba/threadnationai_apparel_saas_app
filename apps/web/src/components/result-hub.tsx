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
  const [sharing, setSharing] = useState(false);

  const shareToWhatsApp = async () => {
    const caption =
      socialContent.local_vibe_caption +
      "\n\n" +
      socialContent.hashtags.join(" ");
    setSharing(true);
    try {
      const res = await fetch(highResUrl);
      const blob = await res.blob();
      const file = new File([blob], `threadnation-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: caption, title: "ThreadNation AI" });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        const encoded = encodeURIComponent(caption);
        window.open(`https://wa.me/?text=${encoded}`, "_blank");
        toast({
          title: "Image downloaded",
          description: "Attach the saved image in your WhatsApp chat.",
        });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast({ title: "Share failed", variant: "destructive" });
      }
    } finally {
      setSharing(false);
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
      <Button
        onClick={shareToWhatsApp}
        disabled={sharing}
        className="w-full bg-[#25D366] hover:bg-[#1eb854] text-white font-syne font-bold rounded-btn h-11"
      >
        {sharing ? "Preparing..." : "Share to WhatsApp 📲"}
      </Button>

      {/* Captions */}
      <CaptionPanel socialContent={socialContent} />

      <Button
        onClick={onGenerateAnother}
        variant="outline"
        className="w-full border-[rgba(255,255,255,0.08)] text-warm-dim hover:text-text-primary rounded-btn h-10"
      >
        Generate Another
      </Button>
    </div>
  );
}
