import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE, DEMO_PAGE_SIZE, demoPhotos } from "@/lib/demo";

const PAGE_SIZE = 24;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// El cursor se interpola en un filtro de PostgREST: solo se aceptan dígitos.
const DIGITS = /^\d{1,9}$/;

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor");
  const cursorId = request.nextUrl.searchParams.get("cursorId");

  if (DEMO_MODE) {
    const after = demoPhotos.findIndex((p) => p.id === cursorId);
    const start = after === -1 ? 0 : after + 1;
    return NextResponse.json({ photos: demoPhotos.slice(start, start + DEMO_PAGE_SIZE) });
  }

  if (cursor && (!DIGITS.test(cursor) || !cursorId || !UUID.test(cursorId))) {
    return NextResponse.json({ error: "invalid_cursor" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: event } = await supabase.from("event").select("*").limit(1).single();
  if (!event) {
    return NextResponse.json({ photos: [] });
  }

  let query = supabase
    .from("photos")
    .select("id, original_filename, width, height, created_at, position")
    .eq("event_id", event.id)
    .order("position", { ascending: true })
    .order("id", { ascending: true })
    .limit(PAGE_SIZE);

  // Cursor compuesto (posición + id), el mismo orden que el del admin: ninguna foto se pierde entre páginas.
  if (cursor && cursorId) {
    query = query.or(`position.gt.${cursor},and(position.eq.${cursor},id.gt.${cursorId})`);
  }

  const { data: photos, error } = await query;

  if (error) {
    return NextResponse.json({ photos: [] }, { status: 500 });
  }

  return NextResponse.json({ photos });
}
