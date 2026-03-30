"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { SocialContent } from "@/hooks/use-generation";

interface CaptionPanelProps {
  socialContent: SocialContent;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={copy}
      variant="outline"
      size="sm"
      className="border-[rgba(255,255,255,0.08)] text-warm-dim hover:text-text-primary hover:border-kente-gold rounded-btn text-xs"
    >
      {copied ? "✓ Copied" : "Copy"}
    </Button>
  );
}

export function CaptionPanel({ socialContent }: CaptionPanelProps) {
  const [activeTab, setActiveTab] = useState("sales");

  const tabs = [
    {
      id: "sales",
      label: "Hustler",
      caption: socialContent.sales_caption,
    },
    {
      id: "lifestyle",
      label: "Storyteller",
      caption: socialContent.lifestyle_caption,
    },
    {
      id: "local",
      label: "Lusaka Vibe",
      caption: socialContent.local_vibe_caption,
    },
  ];

  const allHashtags = socialContent.hashtags.join(" ");

  return (
    <div className="bg-surface-card rounded-card border border-[rgba(255,255,255,0.08)] p-5 space-y-4">
      <p className="text-warm-dim text-xs uppercase tracking-wider font-medium">
        Caption Options
      </p>

      <Tabs defaultValue="sales" onValueChange={setActiveTab}>
        <TabsList className="bg-surface-elevated border border-[rgba(255,255,255,0.08)] rounded-btn p-1 w-full grid grid-cols-3 overflow-hidden">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-xs rounded-btn data-[state=active]:bg-kente-gold data-[state=active]:text-midnight text-warm-dim"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4 space-y-3">
            <div
              className={`bg-surface-card rounded-card p-4 relative transition-all ${
                activeTab === tab.id
                  ? "border-l-[3px] border-l-kente-gold border-t border-r border-b border-[rgba(255,255,255,0.08)]"
                  : "border border-[rgba(255,255,255,0.08)]"
              }`}
            >
              <p className="text-text-primary text-sm leading-relaxed pr-16">
                {tab.caption}
              </p>
              <div className="absolute top-3 right-3">
                <CopyButton text={`${tab.caption}\n\n${allHashtags}`} />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="bg-surface-elevated rounded-card p-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-warm-dim text-xs leading-relaxed flex-1">
            {allHashtags}
          </p>
          <CopyButton text={allHashtags} />
        </div>
      </div>
    </div>
  );
}
