"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toJpgFilename } from "@/lib/filename";
import {
  fetchPhotoBlob,
  isShareCapable,
  logDownload,
  saveFlow,
  shareFile,
  startFileDownload,
} from "@/lib/shareOrDownload";
import type { PhotoMeta } from "@/lib/types";

type Status = "idle" | "preparing" | "shared" | "file" | "error";

const LIVE_MESSAGE: Record<Status, string> = {
  idle: "",
  preparing: "Preparando la foto",
  shared: "Foto guardada",
  file: "Descargando la foto",
  error: "No se pudo guardar la foto",
};

// Se monta una vez por foto (el padre le pone key): el estado y el blob precargado se descartan al cambiar de foto.
export function DownloadButton({ photo, guestName }: { photo: PhotoMeta; guestName: string }) {
  const shareCapable = useMemo(() => isShareCapable(), []);
  const [status, setStatus] = useState<Status>("idle");
  const blobRef = useRef<Blob | null>(null);
  const promiseRef = useRef<Promise<Blob> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loadBlob = useCallback(() => {
    if (!promiseRef.current) {
      const promise = fetchPhotoBlob(photo.id).then((blob) => {
        blobRef.current = blob;
        return blob;
      });
      // Si falla, se permite reintentar en el próximo toque.
      promise.catch(() => {
        promiseRef.current = null;
      });
      promiseRef.current = promise;
    }
    return promiseRef.current;
  }, [photo.id]);

  // Precarga el archivo para poder llamar a share() de forma síncrona en el toque (requisito de iOS).
  // El retraso deja que el <img> del lightbox termine primero y la copia salga del caché HTTP.
  useEffect(() => {
    if (!shareCapable) return;
    const timer = setTimeout(() => void loadBlob(), 350);
    return () => clearTimeout(timer);
  }, [shareCapable, loadBlob]);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function handleSave() {
    if (status === "preparing") return;
    clearTimeout(resetTimer.current);
    setStatus("preparing");
    try {
      const outcome = await saveFlow({
        shareCapable,
        readyBlob: () => blobRef.current,
        loadBlob,
        share: shareFile,
        log: () => logDownload(photo.id, guestName),
        fallback: () => startFileDownload(photo.id, guestName),
        fileName: toJpgFilename(photo.original_filename),
      });
      if (outcome === "cancelled") {
        setStatus("idle");
        return;
      }
      setStatus(outcome);
      if (outcome === "shared" && "vibrate" in navigator) navigator.vibrate(15);
      resetTimer.current = setTimeout(() => setStatus("idle"), 2600);
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "preparing"
      ? "Preparando…"
      : status === "error"
        ? "Reintentar"
        : shareCapable
          ? "Guardar en Fotos"
          : "Descargar";

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
        onClick={handleSave}
        disabled={status === "preparing"}
        className="min-h-12 border border-blood bg-blood/90 px-7 py-3 font-display text-lg tracking-widest text-foreground transition active:scale-95 disabled:opacity-60"
      >
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
