export type ShareOutcome = "shared" | "cancelled" | "blocked";
// shared: el usuario completó la hoja de compartir. cancelled: la cerró. file: se usó la descarga de archivo.
export type SaveOutcome = "shared" | "cancelled" | "file";

export type SaveDeps = {
  shareCapable: boolean;
  /** Blob ya precargado, leído de forma síncrona. */
  readyBlob: () => Blob | null;
  /** Espera a que el blob termine de cargar (si la precarga aún no acabó). */
  loadBlob: () => Promise<Blob>;
  share: (file: File) => Promise<ShareOutcome>;
  /** Registra la descarga. Solo se llama si el usuario completó la acción de compartir. */
  log: () => Promise<unknown>;
  /** Descarga de archivo clásica (el servidor la registra por su cuenta). */
  fallback: () => void;
  fileName: string;
};

/**
 * Decide cómo guardar la foto. Con el blob ya precargado, `share` se invoca de forma síncrona
 * dentro del toque del usuario: iOS descarta la activación del gesto tras esperas largas.
 */
export async function saveFlow(d: SaveDeps): Promise<SaveOutcome> {
  if (!d.shareCapable) {
    d.fallback();
    return "file";
  }

  let blob = d.readyBlob();
  if (!blob) {
    try {
      blob = await d.loadBlob();
    } catch {
      d.fallback();
      return "file";
    }
  }

  const file = new File([blob], d.fileName, { type: blob.type || "image/jpeg" });

  let result: ShareOutcome;
  try {
    result = await d.share(file);
  } catch {
    d.fallback();
    return "file";
  }

  if (result === "shared") {
    await d.log().catch(() => {});
    return "shared";
  }
  if (result === "cancelled") return "cancelled";

  d.fallback();
  return "file";
}

/** Hoja de compartir con archivos disponible, y solo en dispositivos táctiles (en escritorio estorba). */
export function isShareCapable(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  if (typeof navigator.share !== "function" || typeof navigator.canShare !== "function") return false;
  if (!window.matchMedia("(pointer: coarse)").matches) return false;
  try {
    return navigator.canShare({ files: [new File(["x"], "x.jpg", { type: "image/jpeg" })] });
  } catch {
    return false;
  }
}

export async function fetchPhotoBlob(photoId: string, signal?: AbortSignal): Promise<Blob> {
  const res = await fetch(`/api/photos/${photoId}/img?v=display`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

export async function logDownload(photoId: string, name: string): Promise<void> {
  await fetch("/api/downloads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoId, name }),
    keepalive: true,
  });
}

export async function shareFile(file: File): Promise<ShareOutcome> {
  try {
    await navigator.share({ files: [file] });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException) {
      if (err.name === "AbortError") return "cancelled";
      if (err.name === "NotAllowedError") return "blocked";
    }
    throw err;
  }
}

export function startFileDownload(photoId: string, guestName: string) {
  // Navegación nativa intencional: dispara la descarga del archivo, no una ruta de la app.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `/api/download/${photoId}?name=${encodeURIComponent(guestName)}`;
}
