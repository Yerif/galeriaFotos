import { AdminPhotoGrid } from "@/components/admin/AdminPhotoGrid";

export default function AdminPhotosPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="title-glow font-display text-3xl text-blood">Fotos</h1>
      <AdminPhotoGrid />
    </div>
  );
}
