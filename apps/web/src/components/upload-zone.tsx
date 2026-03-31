"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please use a JPEG, PNG, or WebP image.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Image must be under 10MB.");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  if (preview) {
    return (
      <div className="space-y-3">
        <div
          className="relative w-full aspect-[4/5] max-h-96 rounded-card overflow-hidden cursor-pointer"
          onClick={() => galleryRef.current?.click()}
        >
          <Image
            src={preview}
            alt="Uploaded garment"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity bg-black/50 rounded-card">
            <p className="text-white text-sm font-medium">Tap to change</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="w-full text-center text-sm text-kente-gold hover:text-kente-gold/80 transition-colors py-1"
        >
          Change photo
        </button>
        <input
          ref={galleryRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Hidden inputs */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      {/* Mobile-only buttons */}
      <div className="sm:hidden space-y-3">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 bg-kente-gold hover:bg-kente-gold/90 active:bg-kente-gold/80 text-midnight font-syne font-bold rounded-btn h-14 transition-colors text-base"
        >
          <span className="text-xl">📷</span>
          Take a Photo
        </button>

        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 bg-surface-card hover:bg-surface-elevated active:bg-surface-elevated border border-[rgba(255,255,255,0.08)] text-text-primary font-syne font-bold rounded-btn h-14 transition-colors text-base"
        >
          <span className="text-xl">🖼️</span>
          Choose from Gallery
        </button>
      </div>

      {/* Desktop drag-and-drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => galleryRef.current?.click()}
        className={`
          hidden sm:flex cursor-pointer rounded-card border-2 border-dashed
          flex-col items-center justify-center p-8 transition-colors
          ${
            dragOver
              ? "border-kente-gold bg-[rgba(201,168,76,0.08)]"
              : "border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.08)]"
          }
        `}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          className="text-kente-gold mb-3"
        >
          <path
            d="M12 16V4m0 0L8 8m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-warm-dim text-sm text-center">
          Drag and drop a photo here
          <br />
          <span className="text-xs">JPEG, PNG, WebP · max 10MB</span>
        </p>
      </div>

      {error && (
        <p className="text-center text-error text-sm">{error}</p>
      )}
    </div>
  );
}
