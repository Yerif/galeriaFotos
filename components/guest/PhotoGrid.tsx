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
    <div className="justified">
      {photos.map((photo, index) => (
        <PhotoThumb key={photo.id} photo={photo} index={index} onOpen={() => onOpen(index)} />
      ))}
    </div>
  );
}
