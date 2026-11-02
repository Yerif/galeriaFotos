"use client";

import { useEffect, useState } from "react";

type AdminPhotoRow = {
  id: string;
  originalFilename: string;
  createdAt: string;
  thumbnailUrl: string | null;
};

export function AdminPhotoGrid() {
  const [rows, setRows] = useState<AdminPhotoRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/photos");
    if (res.ok) {
      const data = await res.json();
      setRows(data.rows);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta foto? No se puede deshacer.")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/admin/photos?id=${id}`, { method: "DELETE" });
  }

  if (loading) return <p className="text-foreground/60">Cargando fotos...</p>;
  if (rows.length === 0) return <p className="text-foreground/60">Todavía no subiste fotos.</p>;

  return (
    <div className="grid grid-cols-3 gap-2">
      {rows.map((row) => (
        <div key={row.id} className="relative aspect-square overflow-hidden rounded-lg bg-panel">
          {row.thumbnailUrl && (
            <img src={row.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}
