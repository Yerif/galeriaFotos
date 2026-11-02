import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEventStatus } from "@/lib/event";

const SIGNED_URL_TTL_SECONDS = 600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const variant = request.nextUrl.searchParams.get("variant") === "display" ? "display" : "thumb";

  const supabase = await createClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("id, event_id, storage_path_display, storage_path_thumb")
    .eq("id", id)
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

  const path = variant === "display" ? photo.storage_path_display : photo.storage_path_thumb;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("photos")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    return NextResponse.json({ error: "signing_failed" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
