import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 24;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const cursor = request.nextUrl.searchParams.get("cursor");

  const { data: event } = await supabase.from("event").select("*").limit(1).single();
  if (!event) {
    return NextResponse.json({ photos: [] });
  }

  let query = supabase
    .from("photos")
    .select("id, original_filename, width, height, created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: photos, error } = await query;

  if (error) {
    return NextResponse.json({ photos: [] }, { status: 500 });
  }

  return NextResponse.json({ photos });
}
