"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGuestIdentity } from "@/components/guest/GuestIdentity";
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

export type SaveStatus = "idle" | "preparing" | "shared" | "file" | "error";

// Lógica de guardado compartida por el botón del lightbox y el icono de cada miniatura.
export function usePhotoSave(photo: PhotoMeta) {
  const { withName } = useGuestIdentity();
  const shareCapable = useMemo(() => isShareCapable(), []);
  const [status, setStatus] = useState<SaveStatus>("idle");
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

  /** Precarga el archivo para poder llamar a share() de forma síncrona en el toque (requisito de iOS). */
  const prefetch = useCallback(() => {
    void loadBlob();
  }, [loadBlob]);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const run = useCallback(
    async (name: string) => {
      clearTimeout(resetTimer.current);
      setStatus("preparing");
      try {
        const outcome = await saveFlow({
          shareCapable,
          readyBlob: () => blobRef.current,
          loadBlob,
          share: shareFile,
          log: () => logDownload(photo.id, name),
          fallback: () => startFileDownload(photo.id, name),
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
    },
    [shareCapable, loadBlob, photo.id, photo.original_filename]
  );

  const save = useCallback(() => {
    if (status === "preparing") return;
    withName(run);
  }, [status, withName, run]);

  return { status, save, shareCapable, prefetch };
}
