"use client";

import { useCallback, useState } from "react";
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

  // Si la imagen ya estaba en caché, onLoad puede no dispararse: se revisa al adjuntar el nodo.
  // La clase se pone directo en el DOM para no re-renderizar cada miniatura al cargar.
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) img.classList.add("is-loaded");
  }, []);

  const width = photo.width || 1;
  const height = photo.height || 1;
  const style = { "--w": width, "--h": height, "--i": index % 8 } as React.CSSProperties;
  const src = `/api/photos/${photo.id}/img?v=thumb${attempt ? `&r=${attempt}` : ""}`;

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
      )}
    </div>
  );
}
