"use client";

import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/admin/UploadDropzone";

export default function AdminUploadPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="title-glow font-display text-3xl text-blood">Subir fotos</h1>
      <UploadDropzone onUploaded={() => router.refresh()} />
    </div>
  );
}
