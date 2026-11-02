"use client";

import { useState } from "react";

export function DownloadButton({
  photoId,
  guestName,
  disabled,
  className = "",
}: {
  photoId: string;
  guestName: string;
  disabled?: boolean;
  className?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  function handleDownload() {
    if (disabled || downloading) return;
    setDownloading(true);
    const url = `/api/download/${photoId}?name=${encodeURIComponent(guestName)}`;
    // Navegación nativa intencional: dispara la descarga del archivo, no una ruta de la app.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = url;
    setTimeout(() => setDownloading(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled || downloading}
      className={`inline-flex items-center justify-center gap-2 border border-blood bg-blood/90 px-5 py-2 text-sm font-display tracking-widest text-foreground transition active:scale-95 disabled:opacity-50 ${className}`}
    >
      {downloading ? "Descargando..." : "Descargar"}
    </button>
  );
}
