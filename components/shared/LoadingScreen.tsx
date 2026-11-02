import { SceneBackground } from "@/components/shared/SceneBackground";
import { Spinner } from "@/components/shared/Spinner";

export function LoadingScreen({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
      <SceneBackground />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <span className="title-glow font-display text-4xl text-blood">La Galería</span>
        <Spinner />
        <p className="text-xs uppercase tracking-widest text-foreground/50">{label}</p>
      </div>
    </div>
  );
}
