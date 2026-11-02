import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEventStatus } from "@/lib/event";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const { photoId } = await params;
  const guestName = request.nextUrl.searchParams.get("name")?.trim().slice(0, 60);

  if (!guestName) {
    return NextResponse.json({ error: "missing_name" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("id, event_id, storage_path_display, original_filename, content_type")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: event } = await supabase
    .from("event")
    .select("*")
    .eq("id", photo.event_id)
    .single();

  if (!event || getEventStatus(event).isExpired) {
    return NextResponse.json({ error: "expired" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: fileBlob, error: downloadError } = await admin.storage
    .from("photos")
    .download(photo.storage_path_display);

  if (downloadError || !fileBlob) {
    return NextResponse.json({ error: "download_failed" }, { status: 500 });
  }

  await admin.from("downloads").insert({
    photo_id: photo.id,
    guest_name: guestName,
    user_agent: request.headers.get("user-agent"),
  });

  const buffer = Buffer.from(await fileBlob.arrayBuffer());

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": photo.content_type,
      "Content-Disposition": `attachment; filename="${photo.original_filename.replace(/"/g, "")}"`,
      "Content-Length": String(buffer.byteLength),
    },
  });
}
