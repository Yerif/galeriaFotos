// Las fotos se recomprimen siempre a JPEG al subirlas, pero el nombre original conserva su
// extensión (.png, .HEIC...). Se normaliza para que el archivo guardado sea coherente.
export function toJpgFilename(original: string): string {
  const base =
    original
      .replace(/\.[^./\\]+$/, "")
      .replace(/[\\/:*?"<>|\r\n]+/g, "_")
      .trim() || "foto";
  return `${base}.jpg`;
}

// Content-Disposition seguro: respaldo ASCII + filename* (RFC 5987) para nombres con acentos o emoji.
export function attachmentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
