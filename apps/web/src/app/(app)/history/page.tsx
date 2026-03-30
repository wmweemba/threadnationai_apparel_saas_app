"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { HistoryResponse, GenerationSummary } from "@threadnation/shared";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  success: {
    label: "Success",
    className: "bg-success/20 text-success border-success/30",
  },
  failed: {
    label: "Failed",
    className: "bg-error/20 text-error border-error/30",
  },
  quality_rejected: {
    label: "Rejected",
    className: "bg-error/10 text-error border-error/20",
  },
};

const PRESET_LABELS: Record<string, string> = {
  studio_clean: "Studio Clean",
  lusaka_lifestyle: "Lusaka Lifestyle",
  garden_shoot: "Garden Shoot",
};

export default function HistoryPage() {
  const { getToken } = useAuth();
  const [generations, setGenerations] = useState<GenerationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await apiClient.get<HistoryResponse>(
          "/api/v1/history",
          token
        );
        setGenerations(data.generations);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [getToken]);

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-syne font-bold text-text-primary mb-2">
            Your History
          </h1>
          <p className="text-text-secondary">Your last 5 generated posts.</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-accent hover:text-accent/80 transition-colors"
        >
          + New Generation
        </Link>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-card bg-surface-elevated" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-card px-4 py-3 text-error text-sm">
          {error}
        </div>
      )}

      {!loading && !error && generations.length === 0 && (
        <div className="border border-border rounded-card p-16 text-center bg-surface-card">
          <p className="text-text-secondary text-sm mb-4">
            No generations yet.
          </p>
          <Link
            href="/dashboard"
            className="text-accent text-sm hover:text-accent/80 transition-colors"
          >
            Create your first post →
          </Link>
        </div>
      )}

      {!loading && generations.length > 0 && (
        <div className="space-y-4">
          {generations.map((gen) => {
            const status = STATUS_LABELS[gen.status] ?? STATUS_LABELS.failed;
            return (
              <div
                key={gen.id}
                className="bg-surface-card border border-border rounded-card p-4 flex gap-4 items-start"
              >
                {gen.previewUrl ? (
                  <div className="relative w-16 h-20 rounded-card overflow-hidden flex-shrink-0 bg-surface-elevated">
                    <Image
                      src={gen.previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-20 rounded-card bg-surface-elevated flex-shrink-0 flex items-center justify-center">
                    <span className="text-text-secondary text-xs">—</span>
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs border ${status.className}`}>
                      {status.label}
                    </Badge>
                    <span className="text-text-secondary text-xs">
                      {PRESET_LABELS[gen.stylePreset] ?? gen.stylePreset}
                    </span>
                    {gen.approved && (
                      <Badge className="text-xs bg-success/20 text-success border-success/30">
                        Approved
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span>Quality: {gen.inputQualityScore}/100</span>
                    <span>·</span>
                    <span>
                      {new Date(gen.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
