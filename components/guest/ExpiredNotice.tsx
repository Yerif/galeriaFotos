export function ExpiredNotice() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-5xl">🕯️🎃🕸️</p>
      <h1 className="font-display text-3xl text-pumpkin">Disponibilidad vencida</h1>
      <p className="max-w-sm text-foreground/70">
        El plazo de una semana para ver y descargar las fotos de la fiesta ya terminó.
        Gracias por venir — ¡nos vemos en la próxima!
      </p>
    </div>
  );
}
