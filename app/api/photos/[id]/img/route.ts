import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_MODE, demoPhotoUrl } from "@/lib/demo";
import { MAX_CACHE_SECONDS, cacheSecondsUntilDeadline } from "@/lib/event";

// Sirve los bytes de la foto desde el mismo origen. La cabecera de caché se acota al
// tiempo que falta para el plazo, así ninguna copia (navegador/CDN) sobrevive al vencimiento.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const variant = request.nextUrl.searchParams.get("v") === "display" ? "display" : "thumb";

  if (DEMO_MODE) {
    const file = await readFile(path.join(process.cwd(), "public", demoPhotoUrl(id)));
    return new NextResponse(file, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": `public, max-age=${MAX_CACHE_SECONDS}, s-maxage=${MAX_CACHE_SECONDS}`,
      },
    });
  }

  const admin = createAdminClient();

  const { data: photo } = await admin
    .from("photos")
    .select("storage_path_display, storage_path_thumb, event(deadline_at)")
    .eq("id", id)
    .maybeSingle();

  if (!photo) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const event = Array.isArray(photo.event) ? photo.event[0] : photo.event;
  const maxAge = cacheSecondsUntilDeadline(event?.deadline_at ?? null);

  if (maxAge === null) {
    return NextResponse.json({ error: "expired" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const storagePath = variant === "display" ? photo.storage_path_display : photo.storage_path_thumb;
  const { data: blob, error } = await admin.storage.from("photos").download(storagePath);

  if (error || !blob) {
    return NextResponse.json({ error: "storage_failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  return new NextResponse(blob, {
    headers: {
      "Content-Type": blob.type || "image/jpeg",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
