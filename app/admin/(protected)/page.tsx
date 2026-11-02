import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "@/lib/event";
import { DEMO_MODE } from "@/lib/demo";

export default async function AdminDashboardPage() {
  if (DEMO_MODE) {
    return <AdminDashboardView photoCount={9} downloadCount={14} status={{ isExpired: false, daysRemaining: 5 }} />;
  }

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
    <AdminDashboardView
      photoCount={photoCount ?? 0}
      downloadCount={downloadCount ?? 0}
      status={status}
    />
  );
}

function AdminDashboardView({
  photoCount,
  downloadCount,
  status,
}: {
  photoCount: number;
  downloadCount: number;
  status: { isExpired: boolean; daysRemaining: number | null } | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="title-glow font-display text-3xl text-blood">Dashboard</h1>

      <div className="border border-ash bg-panel p-4">
        {status ? (
          status.isExpired ? (
            <p className="text-blood">La galería ya venció.</p>
          ) : status.daysRemaining === null ? (
            <p className="text-foreground/70">
              Aún no hay fecha límite — se fijará con la primera foto que subas.
            </p>
          ) : (
            <p className="text-foreground/90">
              Quedan {status.daysRemaining} día(s) para descargar.
            </p>
          )
        ) : (
          <p className="text-foreground/70">No se encontró el evento.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-ash bg-panel p-4 text-center">
          <p className="font-display text-3xl text-blood">{photoCount ?? 0}</p>
          <p className="text-xs uppercase tracking-widest text-foreground/60">Fotos subidas</p>
        </div>
        <div className="border border-ash bg-panel p-4 text-center">
          <p className="font-display text-3xl text-blood">{downloadCount ?? 0}</p>
          <p className="text-xs uppercase tracking-widest text-foreground/60">Descargas</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <Link
          href="/admin/upload"
          className="border border-blood bg-blood/90 px-4 py-3 text-center font-display tracking-widest text-foreground"
        >
          Subir fotos
        </Link>
        <Link
          href="/admin/photos"
          className="border border-ash px-4 py-3 text-center uppercase tracking-widest text-foreground/80"
        >
          Ver fotos
        </Link>
        <Link
          href="/admin/stats"
          className="border border-ash px-4 py-3 text-center uppercase tracking-widest text-foreground/80"
        >
          Ver descargas
        </Link>
        <Link
          href="/admin/settings"
          className="border border-ash px-4 py-3 text-center uppercase tracking-widest text-foreground/80"
        >
          Ajustes
        </Link>
      </div>
    </div>
  );
}
