import { SceneBackground } from "@/components/shared/SceneBackground";
import { Spinner } from "@/components/shared/Spinner";

export function LoadingScreen({ label = "Preparando la galería..." }: { label?: string }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
      <SceneBackground />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <span className="font-display text-4xl text-pumpkin">🎃 Halloween</span>
        <Spinner />
        <p className="text-sm text-foreground/70">{label}</p>
      </div>
    </div>
  );
}
