import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "@/lib/event";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: event } = await supabase.from("event").select("*").limit(1).single();
  const { count: photoCount } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true });
  const { count: downloadCount } = await supabase
    .from("downloads")
    .select("id", { count: "exact", head: true });

  const status = event ? getEventStatus(event) : null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl text-pumpkin">Dashboard</h1>

      <div className="rounded-xl border border-witch/30 bg-panel p-4">
        {status ? (
          status.isExpired ? (
            <p className="text-red-400">⏳ La galería ya venció.</p>
          ) : status.daysRemaining === null ? (
            <p className="text-foreground/70">
              Aún no hay fecha límite — se fijará con la primera foto que subas.
            </p>
          ) : (
            <p className="text-foreground/90">
              ⏳ Quedan {status.daysRemaining} día(s) para descargar.
            </p>
          )
        ) : (
          <p className="text-foreground/70">No se encontró el evento.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-witch/30 bg-panel p-4 text-center">
          <p className="text-3xl font-semibold text-pumpkin">{photoCount ?? 0}</p>
          <p className="text-sm text-foreground/70">Fotos subidas</p>
        </div>
        <div className="rounded-xl border border-witch/30 bg-panel p-4 text-center">
          <p className="text-3xl font-semibold text-pumpkin">{downloadCount ?? 0}</p>
          <p className="text-sm text-foreground/70">Descargas</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/admin/upload"
          className="rounded-lg bg-pumpkin px-4 py-3 text-center font-semibold text-black"
        >
          📤 Subir fotos
        </Link>
        <Link
          href="/admin/photos"
          className="rounded-lg border border-witch/50 px-4 py-3 text-center"
        >
          🖼️ Ver fotos
        </Link>
        <Link
          href="/admin/stats"
          className="rounded-lg border border-witch/50 px-4 py-3 text-center"
        >
          📊 Ver descargas
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-lg border border-witch/50 px-4 py-3 text-center"
        >
          ⚙️ Ajustes
        </Link>
      </div>
    </div>
  );
}
