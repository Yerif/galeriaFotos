import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_MODE, demoPhotos, demoPhotoUrl } from "@/lib/demo";
import { isCompleteOrder } from "@/lib/reorder";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  if (DEMO_MODE) {
    return NextResponse.json({
      rows: demoPhotos.map((p) => ({
        id: p.id,
        originalFilename: p.original_filename,
        createdAt: p.created_at,
        position: p.position,
        thumbnailUrl: demoPhotoUrl(p.id),
      })),
    });
  }

  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: photos, error } = await supabase
    .from("photos")
    .select("id, original_filename, storage_path_thumb, created_at, position")
    .order("position", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "query_failed", detail: error.message }, { status: 500 });
  }

  // Una sola llamada para firmar todas las miniaturas (antes era una por foto).
  const paths = (photos ?? []).map((p) => p.storage_path_thumb);
  const { data: signed } = paths.length
    ? await supabase.storage.from("photos").createSignedUrls(paths, 3600)
    : { data: [] };
  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  const rows = (photos ?? []).map((photo) => ({
    id: photo.id,
    originalFilename: photo.original_filename,
    createdAt: photo.created_at,
    position: photo.position,
    thumbnailUrl: urlByPath.get(photo.storage_path_thumb) ?? null,
  }));

  return NextResponse.json({ rows });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    displayPath,
    thumbPath,
    originalFilename,
    contentType,
    sizeBytes,
    width,
    height,
  } = body ?? {};

  if (!displayPath || !thumbPath || !originalFilename || !contentType) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: event, error: eventError } = await supabase
    .from("event")
    .select("id")
    .limit(1)
    .single();
  if (!event) {
    return NextResponse.json(
      { error: "no_event", detail: eventError?.message ?? "unknown" },
      { status: 500 }
    );
  }

  const { data: last } = await supabase
    .from("photos")
    .select("position")
    .eq("event_id", event.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: photo, error } = await supabase
    .from("photos")
    .insert({
      event_id: event.id,
      position: (last?.position ?? 0) + 1,
      storage_path_display: displayPath,
      storage_path_thumb: thumbPath,
      original_filename: originalFilename,
      content_type: contentType,
      size_bytes: sizeBytes ?? 0,
      width: width ?? null,
      height: height ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "insert_failed", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ photo });
}

// Guarda el orden completo elegido por el admin: { ids: [...] } en el orden en que deben mostrarse.
export async function PATCH(request: NextRequest) {
  // En modo demo no hay sesión de admin (GET ya lo permite): se responde ok sin tocar nada.
  if (!DEMO_MODE && !(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.length > 5000 || !ids.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ ok: true });
  }

  const orderedIds = ids as string[];
  if (!orderedIds.every((id) => UUID.test(id))) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: existing, error: listError } = await supabase.from("photos").select("id");
  if (listError) {
    return NextResponse.json({ error: "query_failed", detail: listError.message }, { status: 500 });
  }

  // Si se subió o borró una foto mientras el admin ordenaba, el orden ya no es completo: que recargue.
  if (!isCompleteOrder(orderedIds, (existing ?? []).map((p) => p.id))) {
    return NextResponse.json({ error: "stale_order" }, { status: 409 });
  }

  const { error } = await supabase.rpc("reorder_photos", { photo_ids: orderedIds });
  if (error) {
    return NextResponse.json({ error: "reorder_failed", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!DEMO_MODE && !(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Borrar TODAS las fotos. Exige all=1 explícito para que un id omitido nunca borre todo por accidente.
  if (request.nextUrl.searchParams.get("all") === "1") {
    if (DEMO_MODE) return NextResponse.json({ ok: true, deleted: 0 });
    return deleteAllPhotos();
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("storage_path_display, storage_path_thumb")
    .eq("id", id)
    .maybeSingle();

  if (!photo) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await supabase.storage
    .from("photos")
    .remove([photo.storage_path_display, photo.storage_path_thumb]);

  const { error } = await supabase.from("photos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function deleteAllPhotos() {
  const supabase = createAdminClient();

  const { data: photos, error: listError } = await supabase
    .from("photos")
    .select("storage_path_display, storage_path_thumb");
  if (listError) {
    return NextResponse.json({ error: "query_failed", detail: listError.message }, { status: 500 });
  }

  // Storage permite borrar hasta 1000 objetos por llamada.
  const paths = (photos ?? []).flatMap((p) => [p.storage_path_display, p.storage_path_thumb]);
  for (let i = 0; i < paths.length; i += 1000) {
    const { error } = await supabase.storage.from("photos").remove(paths.slice(i, i + 1000));
    if (error) {
      return NextResponse.json({ error: "storage_failed", detail: error.message }, { status: 500 });
    }
  }

  // También se borra el historial de descargas (on delete cascade).
  const { error: deleteError } = await supabase.from("photos").delete().not("id", "is", null);
  if (deleteError) {
    return NextResponse.json({ error: "delete_failed", detail: deleteError.message }, { status: 500 });
  }

  // Sin fotos no hay plazo: si no se reinicia, las fotos nuevas heredarían un plazo viejo (quizá ya vencido)
  // porque el trigger solo fija los 7 días cuando deadline_at es nulo.
  await supabase
    .from("event")
    .update({ first_photo_uploaded_at: null, deadline_at: null, deadline_overridden: false })
    .not("id", "is", null);

  return NextResponse.json({ ok: true, deleted: photos?.length ?? 0 });
}
