export function CountdownBanner({ daysRemaining }: { daysRemaining: number | null }) {
  if (daysRemaining === null) {
    return (
      <div className="border border-ash px-4 py-2 text-center text-xs uppercase tracking-widest text-foreground/60">
        Sin fecha límite todavía
      </div>
    );
  }

  const urgent = daysRemaining <= 2;

  return (
    <div
      className={`border px-4 py-2 text-center text-xs uppercase tracking-widest ${
        urgent
          ? "animate-flicker border-blood bg-blood/20 text-blood-bright"
          : "border-ash text-foreground/70"
      }`}
    >
      {daysRemaining === 0
        ? "Última noche para descargar"
        : `Quedan ${daysRemaining} día${daysRemaining === 1 ? "" : "s"} antes de que desaparezcan`}
    </div>
  );
}
