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
