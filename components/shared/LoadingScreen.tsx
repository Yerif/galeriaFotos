import { Spinner } from "@/components/shared/Spinner";

// Solo CSS: esta pantalla se ve una fracción de segundo mientras llega la página, así que no vale
// la pena descargar WebGL para ella.
export function LoadingScreen({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-4 overflow-hidden bg-background">
      <div className="fog" aria-hidden="true" data-fog="css">
        <div className="fog-css" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <span className="title-glow font-display text-4xl text-blood-bright">La Galería</span>
        <Spinner />
        <p className="text-xs uppercase tracking-widest text-foreground/60">{label}</p>
      </div>
    </div>
  );
}
