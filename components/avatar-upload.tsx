"use client";

import { useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Camera, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AvatarUploadProps {
  name: string;
  avatar: string | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

async function getCroppedBlob(imageSrc: string, croppedAreaPixels: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
      "image/jpeg",
      0.9,
    );
  });
}

export function AvatarUpload({ name, avatar: initialAvatar }: AvatarUploadProps) {
  const [avatar, setAvatar] = useState(initialAvatar);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5 MB");
      return;
    }

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);

    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  function handleCancelCrop() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  async function handleConfirmCrop() {
    if (!cropSrc || !croppedAreaPixels) return;

    setUploading(true);
    setError(null);

    try {
      const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);

      const formData = new FormData();
      formData.append("file", blob, "avatar.jpg");

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al subir la imagen");
      } else {
        setAvatar(data.avatarUrl);
        window.dispatchEvent(new CustomEvent("avatar-updated", { detail: data.avatarUrl }));
      }
    } catch {
      setError("Error al procesar la imagen. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div className="relative inline-flex">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="group relative flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold select-none overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Cambiar foto de perfil"
        >
          {uploading ? (
            <Loader2 className="size-7 animate-spin" />
          ) : avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className="size-20 object-cover" />
          ) : (
            getInitials(name)
          )}

          {!uploading && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="size-6 text-white" />
            </span>
          )}
        </button>

        {/* Pencil badge */}
        {!uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Cambiar foto de perfil"
            className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-background border border-border shadow-sm text-foreground"
          >
            <Pencil className="size-3" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive text-center" role="alert">
          {error}
        </p>
      )}

      {/* Crop dialog */}
      <Dialog open={!!cropSrc} onOpenChange={(open) => { if (!open) handleCancelCrop(); }}>
        <DialogContent className="w-full max-w-sm p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle>Recortar foto</DialogTitle>
          </DialogHeader>

          <div className="relative w-full" style={{ height: 300 }}>
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          {/* Zoom slider */}
          <div className="px-4 pt-3 pb-1">
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Zoom"
            />
          </div>

          <DialogFooter className="px-4 pb-4 pt-2 gap-2">
            <Button variant="outline" onClick={handleCancelCrop}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmCrop} disabled={uploading}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : "Recortar y guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
