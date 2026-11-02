"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PhotoGrid } from "@/components/guest/PhotoGrid";
import { Lightbox } from "@/components/guest/Lightbox";
import { GalleryHeader } from "@/components/guest/GalleryHeader";
import { GuestIdentityProvider } from "@/components/guest/GuestIdentity";
import { IntroTitleCard } from "@/components/guest/IntroTitleCard";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { useIntro } from "@/lib/useIntro";
import type { PhotoMeta } from "@/lib/types";

const PAGE_SIZE = 24;

export function GalleryClient({
  initialPhotos,
  totalCount,
  deadlineAt,
}: {
  initialPhotos: PhotoMeta[];
  totalCount: number;
  deadlineAt: string | null;
}) {
  const { playing: introPlaying, finish: finishIntro } = useIntro();
  const [photos, setPhotos] = useState(initialPhotos);
  const [hasMore, setHasMore] = useState(initialPhotos.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setLoadFailed(false);
    const last = photos[photos.length - 1];
    try {
      // Cursor compuesto (posición + id): coincide con el orden que definió el admin.
      const res = await fetch(
        `/api/photos?cursor=${last?.position ?? ""}&cursorId=${encodeURIComponent(last?.id ?? "")}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { photos: PhotoMeta[] } = await res.json();
      setPhotos((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...data.photos.filter((p) => !seen.has(p.id))];
      });
      setHasMore(data.photos.length === PAGE_SIZE);
    } catch {
      // Sin esto, un fallo haría que el observador reintentara sin parar. Se muestra un botón.
      setLoadFailed(true);
    }
    setLoadingMore(false);
  }, [photos, hasMore, loadingMore]);

  // El contenido se renderiza ya en el servidor, así que el sentinel existe en el primer efecto.
  // (Antes la galería devolvía null hasta montar: el observador nunca se enganchaba y solo se veían 24 fotos.)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loadFailed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, loadFailed]);

  return (
    <GuestIdentityProvider>
      <div className="relative mx-auto w-full max-w-2xl px-4 py-6">
        <AmbientBackground />
        {introPlaying && <IntroTitleCard onDone={finishIntro} />}

        <GalleryHeader deadlineAt={deadlineAt} />

        <PhotoGrid photos={photos} onOpen={setLightboxIndex} />

        {photos.length === 0 && (
          <p className="mt-10 text-center text-sm uppercase tracking-widest text-foreground/60">
            Todavía no hay fotos. Vuelve pronto.
          </p>
        )}

        <div ref={sentinelRef} className="h-4" />

        {loadingMore && (
          <p className="py-6 text-center text-xs uppercase tracking-widest text-foreground/60">
            Cargando más fotos…
          </p>
        )}
        {loadFailed && (
          <div className="py-6 text-center">
            <button
              type="button"
              onClick={() => void loadMore()}
              className="border border-blood px-5 py-3 font-display tracking-widest text-foreground"
            >
              No se pudieron cargar más fotos · Reintentar
            </button>
          </div>
        )}

        <Lightbox
          photos={photos}
          index={lightboxIndex}
          total={Math.max(totalCount, photos.length)}
          onClose={() => setLightboxIndex(-1)}
          onIndexChange={setLightboxIndex}
        />
      </div>
    </GuestIdentityProvider>
  );
}
