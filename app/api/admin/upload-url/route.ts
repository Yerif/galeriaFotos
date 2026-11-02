import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { ext } = await request.json();
  const safeExt = typeof ext === "string" && /^[a-z0-9]{1,5}$/i.test(ext) ? ext : "jpg";
  const id = randomUUID();
  const displayPath = `display/${id}.${safeExt}`;
  const thumbPath = `thumb/${id}.${safeExt}`;

  const supabase = createAdminClient();

  const [displayUpload, thumbUpload] = await Promise.all([
    supabase.storage.from("photos").createSignedUploadUrl(displayPath),
    supabase.storage.from("photos").createSignedUploadUrl(thumbPath),
  ]);

  if (displayUpload.error || thumbUpload.error) {
    const detail = displayUpload.error?.message ?? thumbUpload.error?.message ?? "unknown";
    return NextResponse.json({ error: "signing_failed", detail }, { status: 500 });
  }

  return NextResponse.json({
    displayPath,
    thumbPath,
    displayUpload: displayUpload.data,
    thumbUpload: thumbUpload.data,
  });
}
