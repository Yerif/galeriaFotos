import { createClient } from "@/lib/supabase/server";
import { DeadlineEditor } from "@/components/admin/DeadlineEditor";
import { DEMO_MODE, demoDeadlineIso } from "@/lib/demo";

export default async function AdminSettingsPage() {
  const event = DEMO_MODE
    ? { deadline_at: demoDeadlineIso() }
    : await (async () => {
        const supabase = await createClient();
        const { data } = await supabase.from("event").select("*").limit(1).single();
        return data;
      })();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="title-glow font-display text-3xl text-blood-bright">Ajustes</h1>
      <p className="text-sm text-foreground/70">
        Por defecto, la galería se bloquea 7 días después de subir la primera foto.
        Puedes ajustar manualmente la fecha límite aquí.
      </p>
      <DeadlineEditor initialDeadline={event?.deadline_at ?? null} />
    </div>
  );
}
