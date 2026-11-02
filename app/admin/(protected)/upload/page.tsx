"use client";

import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/admin/UploadDropzone";

export default function AdminUploadPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl text-pumpkin">Subir fotos</h1>
      <UploadDropzone onUploaded={() => router.refresh()} />
    </div>
  );
}
