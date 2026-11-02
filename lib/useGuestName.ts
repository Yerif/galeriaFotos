"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "guestName";

export function useGuestName() {
  const [guestName, setGuestName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Leído tras montar (no en el render) para que SSR y la primera pintura coincidan
    // y evitar un mismatch de hidratación con el valor real de localStorage.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGuestName(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      setGuestName(null);
    }
    setReady(true);
  }, []);

  const saveGuestName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    } catch {
      // Storage bloqueado (modo privado, etc.) — seguimos solo con el estado en memoria.
    }
    setGuestName(trimmed);
  }, []);

  return { guestName, ready, saveGuestName };
}
