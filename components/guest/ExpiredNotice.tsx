export function ExpiredNotice() {
  return (
    <div className="scanlines flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">Fin de la función</p>
      <h1 className="title-glow font-display text-4xl text-blood-bright">Se acabó el plazo</h1>
      <p className="max-w-sm text-foreground/70">
        El plazo de una semana para ver y descargar las fotos de la fiesta ya terminó.
        Las luces se apagaron — gracias por venir.
      </p>
    </div>
  );
}
