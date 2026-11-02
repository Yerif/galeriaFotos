export function PhotoThumb({
  photoId,
  onOpen,
}: {
  photoId: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative aspect-square overflow-hidden border border-ash bg-panel [content-visibility:auto] [contain-intrinsic-size:auto_130px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/photos/${photoId}/img?v=thumb`}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform active:scale-95"
      />
    </button>
  );
}
