// Fondo vivo de la galería: niebla roja que deriva + motas que suben despacio.
// Todo con CSS y solo transform/opacity (compositor). Posiciones fijas para no desajustar la hidratación.
const MOTES = [
  { left: 6, size: 3, dur: 26, delay: 0, sway: 18 },
  { left: 14, size: 2, dur: 31, delay: 7, sway: -14 },
  { left: 22, size: 4, dur: 23, delay: 3, sway: 22 },
  { left: 31, size: 2, dur: 34, delay: 11, sway: -20 },
  { left: 39, size: 3, dur: 28, delay: 5, sway: 16 },
  { left: 48, size: 2, dur: 36, delay: 14, sway: -12 },
  { left: 56, size: 4, dur: 25, delay: 9, sway: 24 },
  { left: 63, size: 3, dur: 30, delay: 2, sway: -18 },
  { left: 71, size: 2, dur: 33, delay: 16, sway: 14 },
  { left: 79, size: 3, dur: 27, delay: 6, sway: -22 },
  { left: 86, size: 4, dur: 24, delay: 12, sway: 20 },
  { left: 93, size: 2, dur: 35, delay: 4, sway: -16 },
];

export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-mist ambient-mist-a" />
      <div className="ambient-mist ambient-mist-b" />
      {MOTES.map((m) => (
        <i
          key={m.left}
          className="ambient-mote"
          style={
            {
              left: `${m.left}%`,
              width: m.size,
              height: m.size,
              "--sway": `${m.sway}px`,
              animationDuration: `${m.dur}s`,
              animationDelay: `-${m.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
