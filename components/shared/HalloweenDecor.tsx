export function HalloweenDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <span className="absolute left-4 top-6 text-3xl opacity-70 animate-float-slow">
        🦇
      </span>
      <span className="absolute right-6 top-16 text-2xl opacity-60 animate-float-slow [animation-delay:1.5s]">
        🦇
      </span>
      <span className="absolute left-10 bottom-10 text-4xl opacity-50 animate-float-slow [animation-delay:3s]">
        🕸️
      </span>
      <span className="absolute right-10 top-1/2 text-3xl opacity-40 animate-float-slow [animation-delay:2s]">
        👻
      </span>
    </div>
  );
}
