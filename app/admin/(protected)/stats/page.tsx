import { AdminStatsTable } from "@/components/admin/AdminStatsTable";

export default function AdminStatsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl text-pumpkin">Descargas</h1>
      <AdminStatsTable />
    </div>
  );
}
