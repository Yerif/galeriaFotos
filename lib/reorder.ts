/** Mueve `id` al principio de la lista (devuelve una lista nueva). */
export function moveToFront<T extends { id: string }>(items: T[], id: string): T[] {
  const index = items.findIndex((item) => item.id === id);
  if (index <= 0) return items;
  return [items[index], ...items.slice(0, index), ...items.slice(index + 1)];
}

/**
 * Un orden es válido solo si contiene exactamente las mismas fotos que existen (sin faltantes,
 * repetidas ni ajenas). Un orden parcial dejaría posiciones duplicadas con las fotos no incluidas.
 */
export function isCompleteOrder(orderedIds: string[], existingIds: string[]): boolean {
  if (orderedIds.length !== existingIds.length) return false;
  const existing = new Set(existingIds);
  const seen = new Set<string>();
  for (const id of orderedIds) {
    if (!existing.has(id) || seen.has(id)) return false;
    seen.add(id);
  }
  return true;
}

const collator = new Intl.Collator("es", { numeric: true, sensitivity: "base" });

/**
 * Ordena por nombre de archivo de forma "natural": ignora mayúsculas y acentos y compara los números como
 * números (…-2 antes que …-10, 002 antes que 010). Devuelve una lista nueva; el id desempata.
 */
export function sortByFilename<T extends { id: string; originalFilename: string }>(
  items: T[],
  direction: "asc" | "desc" = "asc"
): T[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...items].sort(
    (a, b) => sign * collator.compare(a.originalFilename, b.originalFilename) || a.id.localeCompare(b.id)
  );
}
