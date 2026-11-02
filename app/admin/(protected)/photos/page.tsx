import { AdminPhotoGrid } from "@/components/admin/AdminPhotoGrid";

export default function AdminPhotosPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl text-pumpkin">Fotos</h1>
      <AdminPhotoGrid />
    </div>
  );
}
