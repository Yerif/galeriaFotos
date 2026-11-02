import { AdminStatsTable } from "@/components/admin/AdminStatsTable";

export default function AdminStatsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="title-glow font-display text-3xl text-blood-bright">Descargas</h1>
      <AdminStatsTable />
    </div>
  );
}
