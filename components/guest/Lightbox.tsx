"use client";

import { useMemo } from "react";
import YetAnotherLightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { DownloadButton } from "@/components/guest/DownloadButton";
import type { PhotoMeta } from "@/lib/types";

declare module "yet-another-react-lightbox" {
  interface SlideImage {
    photoId?: string;
  }
}

export function Lightbox({
  photos,
  index,
  total,
  onClose,
  onIndexChange,
}: {
  photos: PhotoMeta[];
  index: number;
  total: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const slides = useMemo(
    () =>
      photos.map((photo, i) => ({
        src: `/api/photos/${photo.id}/img?v=display`,
        width: photo.width ?? undefined,
        height: photo.height ?? undefined,
        alt: `Foto ${i + 1}`,
        photoId: photo.id,
      })),
    [photos]
  );
  const current = index >= 0 ? photos[index] : undefined;

  return (
    <YetAnotherLightbox
      open={index >= 0}
      close={onClose}
      index={Math.max(index, 0)}
      slides={slides}
      plugins={[Zoom]}
      on={{ view: ({ index: i }) => onIndexChange(i) }}
      controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
      // finito + precarga de 1: al abrir la primera foto no se bajan las del otro extremo (datos móviles).
      carousel={{ finite: true, preload: 1 }}
      animation={{ fade: 200, swipe: 260 }}
      zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      labels={{
        Previous: "Foto anterior",
        Next: "Foto siguiente",
        Close: "Cerrar",
        "Zoom in": "Acercar",
        "Zoom out": "Alejar",
      }}
      render={{
        // La miniatura (ya en caché por venir de la grilla) se ve al instante detrás mientras llega la foto grande.
        slideContainer: ({ slide, children }) => {
          const photoId = (slide as { photoId?: string }).photoId;
          return (
            <div
              className="lb-slide"
              style={photoId ? { backgroundImage: `url(/api/photos/${photoId}/img?v=thumb)` } : undefined}
            >
              {children}
            </div>
          );
        },
        controls: () =>
          current ? (
            <>
              {/* Total real de la galería (no solo lo ya cargado por paginación). */}
              <div className="lb-counter" aria-live="polite">
                {index + 1} / {total}
              </div>
            <div className="lb-download-bar">
              <DownloadButton key={current.id} photo={current} />
            </div>
            </>
          ) : null,
      }}
    />
  );
}
