"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { NamePrompt } from "@/components/guest/NamePrompt";
import { useGuestName } from "@/lib/useGuestName";

type Identity = {
  guestName: string | null;
  /**
   * Ejecuta `action` con el nombre del invitado. Si ya lo dio, se ejecuta al instante (síncrono, dentro
   * del mismo toque). Si no, se le pide y la acción corre dentro del envío del formulario: ese envío es
   * un gesto nuevo del usuario, lo que mantiene vivo el permiso de la hoja de compartir en iOS.
   */
  withName: (action: (name: string) => void) => void;
};

const IdentityContext = createContext<Identity | null>(null);

export function useGuestIdentity(): Identity {
  const value = useContext(IdentityContext);
  if (!value) throw new Error("useGuestIdentity debe usarse dentro de GuestIdentityProvider");
  return value;
}

export function GuestIdentityProvider({ children }: { children: React.ReactNode }) {
  const { guestName, saveGuestName } = useGuestName();
  const [asking, setAsking] = useState(false);
  const pending = useRef<((name: string) => void) | null>(null);

  const withName = useCallback(
    (action: (name: string) => void) => {
      if (guestName) {
        action(guestName);
        return;
      }
      pending.current = action;
      setAsking(true);
    },
    [guestName]
  );

  const submit = useCallback(
    (name: string) => {
      const saved = saveGuestName(name);
      const action = pending.current;
      pending.current = null;
      setAsking(false);
      if (saved) action?.(saved);
    },
    [saveGuestName]
  );

  const cancel = useCallback(() => {
    pending.current = null;
    setAsking(false);
  }, []);

  const value = useMemo(() => ({ guestName, withName }), [guestName, withName]);

  return (
    <IdentityContext.Provider value={value}>
      {children}
      {asking && <NamePrompt onSubmit={submit} onCancel={cancel} />}
    </IdentityContext.Provider>
  );
}
