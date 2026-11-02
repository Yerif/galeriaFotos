"use client";

import YetAnotherLightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { SlideImage } from "@/components/guest/SlideImage";
import type { PhotoMeta } from "@/lib/types";

type SlideWithPhotoId = { photoId: string; src: string };

export function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
  guestName,
}: {
  photos: PhotoMeta[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  guestName: string;
}) {
  const slides: SlideWithPhotoId[] = photos.map((p) => ({ photoId: p.id, src: "" }));

  return (
    <YetAnotherLightbox
      open={index >= 0}
      close={onClose}
      index={index >= 0 ? index : 0}
      slides={slides}
      on={{ view: ({ index: i }) => onIndexChange(i) }}
      render={{
        slide: ({ slide }) => (
          <SlideImage photoId={(slide as SlideWithPhotoId).photoId} guestName={guestName} />
        ),
      }}
      carousel={{ finite: false }}
    />
  );
}
