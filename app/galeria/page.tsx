import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "@/lib/event";
import { ExpiredNotice } from "@/components/guest/ExpiredNotice";
import { GalleryClient } from "@/components/guest/GalleryClient";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { DEMO_MODE, demoDeadlineIso, demoPhotos } from "@/lib/demo";

const PAGE_SIZE = 24;

async function GalleryContent() {
  if (DEMO_MODE) {
    return <GalleryClient initialPhotos={demoPhotos} deadlineAt={demoDeadlineIso()} />;
  }

  const supabase = await createClient();

  const { data: event } = await supabase
    .from("event")
    .select("*")
    .limit(1)
    .single();

  if (!event) {
    return <ExpiredNotice />;
  }

  const { isExpired } = getEventStatus(event);

  if (isExpired) {
    return <ExpiredNotice />;
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("id, original_filename, width, height, created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  return <GalleryClient initialPhotos={photos ?? []} deadlineAt={event.deadline_at} />;
}

export default function GaleriaPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <GalleryContent />
    </Suspense>
  );
}
