export function CountdownBanner({ daysRemaining }: { daysRemaining: number | null }) {
  if (daysRemaining === null) {
    return (
      <div className="rounded-lg bg-witch/30 px-4 py-2 text-center text-sm text-foreground/80">
        Las fotos todavía no tienen fecha límite de descarga.
      </div>
    );
  }

  const urgent = daysRemaining <= 2;

  return (
    <div
      className={`rounded-lg px-4 py-2 text-center text-sm font-medium ${
        urgent ? "bg-pumpkin/90 text-black" : "bg-witch/30 text-foreground/90"
      }`}
    >
      {daysRemaining === 0
        ? "⏳ Último día para descargar tus fotos"
        : `⏳ Quedan ${daysRemaining} día${daysRemaining === 1 ? "" : "s"} para descargar tus fotos`}
    </div>
  );
}
