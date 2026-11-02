"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { moveToFront } from "@/lib/reorder";

type AdminPhotoRow = {
  id: string;
  originalFilename: string;
  createdAt: string;
  position: number;
  thumbnailUrl: string | null;
};

type SaveState = "idle" | "saving" | "saved" | "error";

function SortableTile({
  row,
  number,
  onDelete,
  onMoveToFront,
}: {
  row: AdminPhotoRow;
  number: number;
  onDelete: (id: string) => void;
  onMoveToFront: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });

  return (
    <div
      ref={setNodeRef}
      data-photo-id={row.id}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
        touchAction: "manipulation",
      }}
      className={`relative aspect-square select-none overflow-hidden border bg-panel ${
        isDragging ? "border-blood-bright opacity-80 shadow-[0_0_24px_rgba(229,72,77,0.5)]" : "border-ash"
      }`}
      {...attributes}
      {...listeners}
    >
      {row.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.thumbnailUrl}
          alt={`Foto ${number}`}
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
        />
      )}

      <span className="pointer-events-none absolute left-1 top-1 min-w-6 bg-black/80 px-1.5 py-0.5 text-center font-display text-sm tracking-wider text-foreground">
        {number}
      </span>

      <button
        type="button"
        onClick={() => onDelete(row.id)}
        aria-label={`Borrar foto ${number}`}
        className="absolute right-1 top-1 border border-blood/60 bg-black/80 px-2 py-0.5 text-xs uppercase tracking-widest text-blood-bright"
      >
        Borrar
      </button>

      {number > 1 && (
        <button
          type="button"
          onClick={() => onMoveToFront(row.id)}
          aria-label={`Mover la foto ${number} al inicio`}
          className="absolute bottom-1 left-1 border border-ash bg-black/80 px-2 py-1 text-xs uppercase tracking-widest text-foreground/80"
        >
          ↑ Al inicio
        </button>
      )}
    </div>
  );
}

export function AdminPhotoGrid() {
  const [rows, setRows] = useState<AdminPhotoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [save, setSave] = useState<SaveState>("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/photos");
    if (res.ok) {
      const data = await res.json();
      setRows(data.rows);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => clearTimeout(savedTimer.current);
  }, [load]);

  // Ratón: arrastrar tras 6 px. Táctil: mantener presionado 250 ms (así el scroll normal sigue funcionando).
  // MouseSensor y no PointerSensor: este último también recibe los toques y el navegador los cancela al iniciar el scroll.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function persist(next: AdminPhotoRow[]) {
    clearTimeout(savedTimer.current);
    setSave("saving");
    try {
      const res = await fetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((r) => r.id) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSave("saved");
      savedTimer.current = setTimeout(() => setSave("idle"), 2000);
    } catch {
      // Si no se pudo guardar (o el orden quedó desactualizado), se vuelve a leer el orden real del servidor.
      setSave("error");
      await load();
    }
  }

  function applyOrder(next: AdminPhotoRow[]) {
    setRows(next);
    void persist(next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = rows.findIndex((r) => r.id === active.id);
    const to = rows.findIndex((r) => r.id === over.id);
    if (from === -1 || to === -1) return;
    applyOrder(arrayMove(rows, from, to));
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta foto? No se puede deshacer.")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/admin/photos?id=${id}`, { method: "DELETE" });
  }

  if (loading) return <p className="text-foreground/60">Cargando fotos...</p>;
  if (rows.length === 0) return <p className="text-foreground/60">Todavía no subiste fotos.</p>;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground/70">
        Este es el orden en que verán las fotos tus invitados. <strong className="text-foreground">Mantén
        presionada</strong> una foto y arrástrala, o usa «↑ Al inicio».
      </p>

      <p
        role="status"
        aria-live="polite"
        className={`h-5 text-xs uppercase tracking-widest ${save === "error" ? "text-blood-bright" : "text-foreground/60"}`}
      >
        {save === "saving" && "Guardando orden…"}
        {save === "saved" && "Orden guardado"}
        {save === "error" && "No se pudo guardar. Se recargó el orden real."}
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rows.map((r) => r.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-2">
            {rows.map((row, index) => (
              <SortableTile
                key={row.id}
                row={row}
                number={index + 1}
                onDelete={handleDelete}
                onMoveToFront={(id) => applyOrder(moveToFront(rows, id))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
