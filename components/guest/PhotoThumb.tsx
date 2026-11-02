"use client";

import { useCallback, useState } from "react";
import { CheckIcon, DownloadIcon } from "@/components/guest/DownloadIcon";
import { usePhotoSave } from "@/lib/usePhotoSave";
import type { PhotoMeta } from "@/lib/types";

export function PhotoThumb({
  photo,
  index,
  onOpen,
}: {
  photo: PhotoMeta;
  index: number;
  onOpen: () => void;
}) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const { status, save } = usePhotoSave(photo);

  // La galería llega renderizada del servidor: la imagen pudo cargar (o fallar) ANTES de hidratar, y
  // entonces onLoad/onError nunca se disparan. Se revisa el estado real al adjuntar el nodo.
  // La clase se pone directo en el DOM para no re-renderizar cada miniatura al cargar.
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (!img?.complete) return;
    if (img.naturalWidth > 0) img.classList.add("is-loaded");
    else setFailed(true);
  }, []);

  const width = photo.width || 1;
  const height = photo.height || 1;
  const style = { "--w": width, "--h": height, "--i": index % 8 } as React.CSSProperties;
  const src = `/api/photos/${photo.id}/img?v=thumb${attempt ? `&r=${attempt}` : ""}`;
  const done = status === "shared" || status === "file";

  return (
    <div className="jitem border border-ash bg-panel" style={style}>
      {failed ? (
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            setAttempt((n) => n + 1);
          }}
          aria-label={`Reintentar cargar la foto ${index + 1}`}
          className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest text-blood-bright"
        >
          ↻ Reintentar
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Abrir foto ${index + 1}`}
            className="absolute inset-0 block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={attempt}
              ref={imgRef}
              src={src}
              alt={`Foto ${index + 1}`}
              width={width}
              height={height}
              loading="lazy"
              decoding="async"
              onLoad={(e) => e.currentTarget.classList.add("is-loaded")}
              onError={() => setFailed(true)}
              className="thumb-img h-full w-full object-cover"
            />
          </button>
          <button
            type="button"
            onClick={save}
            disabled={status === "preparing"}
            data-status={status}
            aria-label={`Descargar foto ${index + 1}`}
            title="Descargar"
            className="dl-icon"
          >
            {status === "preparing" ? (
              <span className="dl-spin" aria-hidden />
            ) : done ? (
              <CheckIcon />
            ) : (
              <DownloadIcon />
            )}
          </button>
        </>
      )}
    </div>
  );
}
