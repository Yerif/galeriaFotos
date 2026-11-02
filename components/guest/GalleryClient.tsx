"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NamePrompt } from "@/components/guest/NamePrompt";
import { PhotoGrid } from "@/components/guest/PhotoGrid";
import { Lightbox } from "@/components/guest/Lightbox";
import { CountdownBanner } from "@/components/guest/CountdownBanner";
import { useGuestName } from "@/lib/useGuestName";
import type { PhotoMeta } from "@/lib/types";

const PAGE_SIZE = 24;

export function GalleryClient({
  initialPhotos,
  daysRemaining,
}: {
  initialPhotos: PhotoMeta[];
  daysRemaining: number | null;
}) {
  const { guestName, ready, saveGuestName } = useGuestName();
  const [photos, setPhotos] = useState(initialPhotos);
  const [hasMore, setHasMore] = useState(initialPhotos.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const last = photos[photos.length - 1];
    const res = await fetch(
      `/api/photos?cursor=${encodeURIComponent(last?.created_at ?? "")}`
    );
    if (res.ok) {
      const data = await res.json();
      setPhotos((prev) => [...prev, ...data.photos]);
      setHasMore(data.photos.length === PAGE_SIZE);
    }
    setLoadingMore(false);
  }, [photos, hasMore, loadingMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (!ready) return null;

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-6">
      {!guestName && <NamePrompt onSubmit={saveGuestName} />}

      <header className="mb-4 flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-3xl text-pumpkin">🎃 Fotos de Halloween</h1>
        <CountdownBanner daysRemaining={daysRemaining} />
      </header>

      <PhotoGrid photos={photos} onOpen={setLightboxIndex} />

      {photos.length === 0 && (
        <p className="mt-10 text-center text-foreground/60">
          Todavía no hay fotos subidas. ¡Vuelve pronto! 👻
        </p>
      )}

      <div ref={sentinelRef} className="h-4" />

      {guestName && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onIndexChange={setLightboxIndex}
          guestName={guestName}
        />
      )}
    </div>
  );
}
