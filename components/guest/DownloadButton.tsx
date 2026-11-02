"use client";

import { useEffect } from "react";
import { CheckIcon, DownloadIcon } from "@/components/guest/DownloadIcon";
import { usePhotoSave, type SaveStatus } from "@/lib/usePhotoSave";
import type { PhotoMeta } from "@/lib/types";

const LIVE_MESSAGE: Record<SaveStatus, string> = {
  idle: "",
  preparing: "Preparando la foto",
  shared: "Foto guardada",
  file: "Descargando la foto",
  error: "No se pudo guardar la foto",
};

// Se monta una vez por foto (el padre le pone key): el estado y el archivo precargado se descartan al cambiar de foto.
export function DownloadButton({ photo }: { photo: PhotoMeta }) {
  const { status, save, shareCapable, prefetch } = usePhotoSave(photo);

  // El retraso deja que el <img> del lightbox termine primero y la copia salga del caché HTTP.
  useEffect(() => {
    if (!shareCapable) return;
    const timer = setTimeout(prefetch, 350);
    return () => clearTimeout(timer);
  }, [shareCapable, prefetch]);

  const label =
    status === "preparing"
      ? "Preparando…"
      : status === "error"
        ? "Reintentar"
        : shareCapable
          ? "Guardar en Fotos"
          : "Descargar foto";

  return (
    <div className="relative flex flex-col items-center">
      {(status === "shared" || status === "file") && (
        <span
          aria-hidden
          className="stamp pointer-events-none absolute -top-11 border-2 border-blood-bright px-3 py-0.5 font-display text-xl tracking-widest text-blood-bright"
        >
          {status === "shared" ? "Guardada" : "Descargando"}
        </span>
      )}
      <button
        type="button"
        onClick={save}
        disabled={status === "preparing"}
        className="inline-flex min-h-12 items-center gap-3 border border-blood bg-blood/90 px-7 py-3 font-display text-lg tracking-widest text-foreground transition active:scale-95 disabled:opacity-60"
      >
        {status === "shared" || status === "file" ? (
          <CheckIcon className="h-5 w-5" />
        ) : (
          <DownloadIcon className="h-5 w-5" />
        )}
        {label}
      </button>
      {status === "error" && (
        <span className="mt-1 text-xs text-blood-bright">No se pudo guardar. Intenta de nuevo.</span>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {LIVE_MESSAGE[status]}
      </span>
    </div>
  );
}
