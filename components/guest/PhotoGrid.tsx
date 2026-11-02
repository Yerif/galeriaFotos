import { PhotoThumb } from "@/components/guest/PhotoThumb";
import type { PhotoMeta } from "@/lib/types";

export function PhotoGrid({
  photos,
  onOpen,
}: {
  photos: PhotoMeta[];
  onOpen: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {photos.map((photo, index) => (
        <PhotoThumb key={photo.id} photoId={photo.id} onOpen={() => onOpen(index)} />
      ))}
    </div>
  );
}
