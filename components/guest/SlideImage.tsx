"use client";

import { DownloadButton } from "@/components/guest/DownloadButton";

export function SlideImage({
  photoId,
  guestName,
}: {
  photoId: string;
  guestName: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/photos/${photoId}/img?v=display`}
        alt=""
        decoding="async"
        className="max-h-[75vh] w-auto max-w-full border border-ash object-contain"
      />
      <DownloadButton photoId={photoId} guestName={guestName} />
    </div>
  );
}
