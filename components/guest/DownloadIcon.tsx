const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

// Flecha hacia abajo sobre una bandeja: el símbolo de descargar que todo el mundo reconoce.
export function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5v11" />
      <path d="m7 10.5 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}
