import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_MODE } from "@/lib/demo";
import { cacheSecondsUntilDeadline } from "@/lib/event";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Registra una descarga hecha desde la hoja de compartir del sistema (el archivo se obtiene
// por /api/photos/[id]/img, que no registra). Se llama solo después de que el usuario completó la acción.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const photoId = typeof body?.photoId === "string" ? body.photoId : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";

  if (!name) {
    return NextResponse.json({ error: "missing_name" }, { status: 400 });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ ok: true });
  }

  if (!UUID.test(photoId)) {
    return NextResponse.json({ error: "invalid_photo" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: photo } = await admin
    .from("photos")
    .select("id, event(deadline_at)")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const event = Array.isArray(photo.event) ? photo.event[0] : photo.event;
  if (cacheSecondsUntilDeadline(event?.deadline_at ?? null) === null) {
    return NextResponse.json({ error: "expired" }, { status: 403 });
  }

  const { error } = await admin.from("downloads").insert({
    photo_id: photo.id,
    guest_name: name,
    user_agent: request.headers.get("user-agent"),
  });

  if (error) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
