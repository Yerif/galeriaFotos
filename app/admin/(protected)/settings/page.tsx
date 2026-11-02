import { createClient } from "@/lib/supabase/server";
import { DeadlineEditor } from "@/components/admin/DeadlineEditor";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: event } = await supabase.from("event").select("*").limit(1).single();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl text-pumpkin">Ajustes</h1>
      <p className="text-sm text-foreground/70">
        Por defecto, la galería se bloquea 7 días después de subir la primera foto.
        Puedes ajustar manualmente la fecha límite aquí.
      </p>
      <DeadlineEditor initialDeadline={event?.deadline_at ?? null} />
    </div>
  );
}
