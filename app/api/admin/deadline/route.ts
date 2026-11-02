import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { deadline_at } = await request.json();

  const supabase = createAdminClient();
  const { data: event } = await supabase.from("event").select("id").limit(1).single();
  if (!event) {
    return NextResponse.json({ error: "no_event" }, { status: 500 });
  }

  const { error } = await supabase
    .from("event")
    .update({
      deadline_at: deadline_at || null,
      deadline_overridden: Boolean(deadline_at),
    })
    .eq("id", event.id);

  if (error) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
