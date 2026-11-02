"use client";

import { useEffect, useRef, useState } from "react";

export function PhotoThumb({
  photoId,
  onOpen,
}: {
  photoId: string;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || src) return;
    let cancelled = false;
    fetch(`/api/photos/${photoId}/url?variant=thumb`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.url) setSrc(data.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [inView, photoId, src]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className="relative aspect-square overflow-hidden rounded-lg bg-panel"
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform active:scale-95"
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-witch/20" />
      )}
    </button>
  );
}
