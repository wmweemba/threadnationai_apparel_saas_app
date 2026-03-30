"use client";

import type { StylePreset } from "@threadnation/shared";
import { Button } from "@/components/ui/button";

const PRESETS: {
  id: StylePreset;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "studio_clean",
    label: "Studio Clean",
    description: "White studio background, professional fashion lighting",
    icon: "🏙️",
  },
  {
    id: "lusaka_lifestyle",
    label: "Lusaka Lifestyle",
    description: "Modern urban Lusaka café, authentic African energy",
    icon: "☕",
  },
  {
    id: "garden_shoot",
    label: "Garden Shoot",
    description: "Lush tropical garden, soft natural outdoor light",
    icon: "🌿",
  },
];

interface StyleSelectorProps {
  qualityScore: number;
  selected: StylePreset | null;
  onSelect: (preset: StylePreset) => void;
  onGenerate: () => void;
  generating?: boolean;
}

export function StyleSelector({
  qualityScore,
  selected,
  onSelect,
  onGenerate,
  generating = false,
}: StyleSelectorProps) {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Quality badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-success/20 border border-success/40 rounded-btn px-3 py-1.5">
          <span className="text-success text-sm">✓</span>
          <span className="text-success text-sm font-medium">
            Great shot! {qualityScore}/100
          </span>
        </div>
        <p className="text-text-secondary text-sm">Now choose your style.</p>
      </div>

      {/* Preset cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={`
              rounded-card border p-5 text-left transition-all
              ${
                selected === preset.id
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface-card hover:border-accent/50 hover:bg-surface-elevated"
              }
            `}
          >
            <div className="text-3xl mb-3">{preset.icon}</div>
            <p className="font-syne font-semibold text-text-primary mb-1">
              {preset.label}
            </p>
            <p className="text-text-secondary text-xs leading-relaxed">
              {preset.description}
            </p>
            {selected === preset.id && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-accent text-xs">✦</span>
                <span className="text-accent text-xs font-medium">
                  Selected
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={onGenerate}
        disabled={!selected || generating}
        className="w-full bg-accent hover:bg-accent/90 text-background font-syne font-semibold rounded-btn h-12 text-base"
      >
        {generating ? "Starting..." : "Generate Now ✦"}
      </Button>
    </div>
  );
}
