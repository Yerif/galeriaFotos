"use client";

import { useEffect, useState } from "react";

type StatsRow = {
  id: string;
  guestName: string;
  downloadedAt: string;
  photoId: string;
  originalFilename: string;
  thumbnailUrl: string | null;
};

export function AdminStatsTable() {
  const [rows, setRows] = useState<StatsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : { rows: [] }))
      .then((data) => setRows(data.rows ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-foreground/60">Cargando descargas...</p>;
  if (rows.length === 0) return <p className="text-foreground/60">Todavía no hay descargas.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-center gap-3 border border-ash bg-panel p-2"
        >
          {row.thumbnailUrl && (
            <img
              src={row.thumbnailUrl}
              alt=""
              className="h-14 w-14 shrink-0 border border-ash object-cover"
            />
          )}
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-medium">{row.guestName}</p>
            <p className="truncate text-xs text-foreground/60">
              {new Date(row.downloadedAt).toLocaleString("es")}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
