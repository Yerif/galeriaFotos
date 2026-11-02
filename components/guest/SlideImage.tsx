"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/shared/Spinner";
import { DownloadButton } from "@/components/guest/DownloadButton";

export function SlideImage({
  photoId,
  guestName,
}: {
  photoId: string;
  guestName: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Resetea al cambiar de foto antes de pedir la nueva signed URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSrc(null);
    fetch(`/api/photos/${photoId}/url?variant=display`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.url) setSrc(data.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [photoId]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      {src ? (
        <img
          src={src}
          alt=""
          className="max-h-[75vh] w-auto max-w-full border border-ash object-contain"
        />
      ) : (
        <Spinner />
      )}
      <DownloadButton photoId={photoId} guestName={guestName} />
    </div>
  );
}
