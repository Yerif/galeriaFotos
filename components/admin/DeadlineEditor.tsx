"use client";

import { useState } from "react";

function toInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function DeadlineEditor({ initialDeadline }: { initialDeadline: string | null }) {
  const [value, setValue] = useState(toInputValue(initialDeadline));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/deadline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deadline_at: value ? new Date(value).toISOString() : null,
      }),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm text-foreground/70">
        Fecha y hora límite de descarga
      </label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border border-ash bg-background px-4 py-3 text-foreground outline-none focus:border-blood"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="border border-blood bg-blood/90 px-4 py-3 font-display tracking-widest text-foreground disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar fecha límite"}
      </button>
      {saved && <p className="text-sm text-acid">Guardado</p>}
    </div>
  );
}
