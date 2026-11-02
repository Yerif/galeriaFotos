"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

type FileStatus = {
  name: string;
  progress: "comprimiendo" | "subiendo" | "listo" | "error";
  errorDetail?: string;
};

async function readErrorDetail(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body?.detail || body?.error || fallback;
  } catch {
    return fallback;
  }
}

async function compress(file: File, maxWidthOrHeight: number, maxSizeMB: number) {
  return imageCompression(file, {
    maxWidthOrHeight,
    maxSizeMB,
    useWebWorker: true,
    fileType: "image/jpeg",
  });
}

export function UploadDropzone({ onUploaded }: { onUploaded: () => void }) {
  const [files, setFiles] = useState<FileStatus[]>([]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const supabase = createClient();
    const selected = Array.from(fileList);

    setFiles(selected.map((f) => ({ name: f.name, progress: "comprimiendo" })));

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      try {
        const [display, thumb] = await Promise.all([
          compress(file, 1600, 0.6),
          compress(file, 500, 0.15),
        ]);

        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: "subiendo" } : f))
        );

        const urlRes = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ext: "jpg" }),
        });
        if (!urlRes.ok) {
          throw new Error(await readErrorDetail(urlRes, "No se pudo preparar la subida"));
        }
        const { displayPath, thumbPath, displayUpload, thumbUpload } = await urlRes.json();

        const [displayResult, thumbResult] = await Promise.all([
          supabase.storage
            .from("photos")
            .uploadToSignedUrl(displayPath, displayUpload.token, display),
          supabase.storage
            .from("photos")
            .uploadToSignedUrl(thumbPath, thumbUpload.token, thumb),
        ]);
        if (displayResult.error || thumbResult.error) {
          throw new Error(
            displayResult.error?.message || thumbResult.error?.message || "Falló la subida al storage"
          );
        }

        const dims = await getImageDimensions(display);

        const confirmRes = await fetch("/api/admin/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayPath,
            thumbPath,
            originalFilename: file.name,
            contentType: "image/jpeg",
            sizeBytes: display.size,
            width: dims?.width,
            height: dims?.height,
          }),
        });
        if (!confirmRes.ok) {
          throw new Error(await readErrorDetail(confirmRes, "No se pudo guardar la foto"));
        }

        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: "listo" } : f))
        );
      } catch (err) {
        const errorDetail = err instanceof Error ? err.message : "Error desconocido";
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: "error", errorDetail } : f))
        );
      }
    }

    onUploaded();
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-blood/50 bg-panel px-4 py-10 text-center">
        <span className="font-display text-xl tracking-widest text-blood">Subir fotos</span>
        <span className="text-sm text-foreground/60">Puedes seleccionar varias a la vez</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {files.map((f) => (
            <li key={f.name} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{f.name}</span>
                <span
                  className={
                    f.progress === "error"
                      ? "text-blood"
                      : f.progress === "listo"
                      ? "text-acid"
                      : "text-foreground/60"
                  }
                >
                  {f.progress}
                </span>
              </div>
              {f.errorDetail && (
                <span className="truncate text-xs text-blood/70">{f.errorDetail}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getImageDimensions(blob: Blob): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
