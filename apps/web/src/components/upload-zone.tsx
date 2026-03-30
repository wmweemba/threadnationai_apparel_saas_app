"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  // Two separate inputs: one for gallery (no capture), one for camera
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
      // Reset so selecting the same file again triggers onChange
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
          className="w-full text-center text-sm text-accent hover:text-accent/80 transition-colors py-1"
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

      {/* Primary mobile buttons */}
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 active:bg-accent/80 text-background font-syne font-semibold rounded-btn h-14 transition-colors text-base"
      >
        <span className="text-xl">📷</span>
        Take a Photo
      </button>

      <button
        type="button"
        onClick={() => galleryRef.current?.click()}
        className="w-full flex items-center justify-center gap-3 bg-surface-card hover:bg-surface-elevated active:bg-surface-elevated border border-border text-text-primary font-syne font-semibold rounded-btn h-14 transition-colors text-base"
      >
        <span className="text-xl">🖼️</span>
        Choose from Gallery
      </button>

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
          flex-col items-center justify-center p-10 transition-colors
          ${dragOver ? "border-accent bg-surface-elevated" : "border-border bg-surface-card hover:bg-surface-elevated"}
        `}
      >
        <p className="text-text-secondary text-sm text-center">
          or drag and drop a photo here
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
