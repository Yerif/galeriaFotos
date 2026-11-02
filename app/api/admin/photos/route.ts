import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_MODE, demoPhotos, demoPhotoUrl } from "@/lib/demo";

export async function GET() {
  if (DEMO_MODE) {
    return NextResponse.json({
      rows: demoPhotos.map((p) => ({
        id: p.id,
        originalFilename: p.original_filename,
        createdAt: p.created_at,
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
    .select("id, original_filename, storage_path_thumb, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  const rows = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await supabase.storage
        .from("photos")
        .createSignedUrl(photo.storage_path_thumb, 600);
      return {
        id: photo.id,
        originalFilename: photo.original_filename,
        createdAt: photo.created_at,
        thumbnailUrl: data?.signedUrl ?? null,
      };
    })
  );

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

  const { data: event } = await supabase.from("event").select("id").limit(1).single();
  if (!event) {
    return NextResponse.json({ error: "no_event" }, { status: 500 });
  }

  const { data: photo, error } = await supabase
    .from("photos")
    .insert({
      event_id: event.id,
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
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ photo });
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
