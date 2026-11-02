import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: downloads, error } = await supabase
    .from("downloads")
    .select("id, guest_name, downloaded_at, photo_id, photos(storage_path_thumb, original_filename)")
    .order("downloaded_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  const rows = await Promise.all(
    (downloads ?? []).map(async (d) => {
      const photo = d.photos as unknown as {
        storage_path_thumb: string;
        original_filename: string;
      } | null;

      let thumbnailUrl: string | null = null;
      if (photo?.storage_path_thumb) {
        const { data } = await supabase.storage
          .from("photos")
          .createSignedUrl(photo.storage_path_thumb, 600);
        thumbnailUrl = data?.signedUrl ?? null;
      }

      return {
        id: d.id,
        guestName: d.guest_name,
        downloadedAt: d.downloaded_at,
        photoId: d.photo_id,
        originalFilename: photo?.original_filename ?? "",
        thumbnailUrl,
      };
    })
  );

  return NextResponse.json({ rows });
}
