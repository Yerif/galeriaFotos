"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "guestName";

export function useGuestName() {
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    // Leído tras montar (no en el render) para que SSR y la primera pintura coincidan
    // y evitar un mismatch de hidratación con el valor real de localStorage.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGuestName(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      setGuestName(null);
    }
  }, []);

  /** Guarda el nombre y devuelve el valor ya recortado (null si quedó vacío). */
  const saveGuestName = useCallback((name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    } catch {
      // Storage bloqueado (modo privado, etc.) — seguimos solo con el estado en memoria.
    }
    setGuestName(trimmed);
    return trimmed;
  }, []);

  return { guestName, saveGuestName };
}
