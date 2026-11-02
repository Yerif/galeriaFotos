// Posiciones y tiempos fijos (no aleatorios) para que el servidor y el cliente rendericen lo mismo.
const DRIPS = [
  { left: 5, len: 22, w: 4, delay: 0, dur: 7.2 },
  { left: 16, len: 34, w: 3, delay: 2.1, dur: 9.4 },
  { left: 27, len: 16, w: 5, delay: 4.0, dur: 6.6 },
  { left: 39, len: 30, w: 3, delay: 1.0, dur: 8.2 },
  { left: 51, len: 36, w: 4, delay: 3.3, dur: 10.1 },
  { left: 63, len: 18, w: 3, delay: 5.2, dur: 7.4 },
  { left: 75, len: 32, w: 5, delay: 0.8, dur: 9.6 },
  { left: 88, len: 24, w: 3, delay: 2.7, dur: 8.6 },
];

/** Texto con sangre escurriendo desde las letras. Solo anima transform y opacity. */
export function BloodTitle({ children }: { children: React.ReactNode }) {
  return (
    <span className="blood-title">
      {children}
      <span className="blood-drips" aria-hidden="true">
        {DRIPS.map((d) => (
          <i
            key={d.left}
            className="drip"
            style={
              {
                left: `${d.left}%`,
                "--len": `${d.len}px`,
                "--w": `${d.w}px`,
                animationDelay: `${d.delay}s`,
                animationDuration: `${d.dur}s`,
              } as React.CSSProperties
            }
          >
            <u className="drip-stem" />
            <s className="drip-bulb" />
            <b className="drip-fall" />
          </i>
        ))}
      </span>
    </span>
  );
}
