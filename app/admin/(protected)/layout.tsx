import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!DEMO_MODE) {
    const admin = await getAdminSession();
    if (!admin) {
      redirect("/admin/login");
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <nav className="sticky top-0 z-10 flex gap-5 overflow-x-auto border-b border-blood/30 bg-panel px-4 py-3 text-xs uppercase tracking-widest">
        <Link href="/admin" className="shrink-0 font-display text-base tracking-widest text-blood">
          Admin
        </Link>
        <Link href="/admin/upload" className="shrink-0 text-foreground/70">Subir</Link>
        <Link href="/admin/photos" className="shrink-0 text-foreground/70">Fotos</Link>
        <Link href="/admin/stats" className="shrink-0 text-foreground/70">Descargas</Link>
        <Link href="/admin/settings" className="shrink-0 text-foreground/70">Ajustes</Link>
      </nav>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
