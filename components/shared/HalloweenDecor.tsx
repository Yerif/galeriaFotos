export function HalloweenDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blood/50 to-transparent animate-flicker" />
      <div className="absolute left-6 top-10 h-16 w-px bg-blood/20 animate-float-slow" />
      <div className="absolute right-10 top-1/3 h-24 w-px bg-blood/15 animate-float-slow [animation-delay:2s]" />
      <div className="absolute bottom-16 left-1/4 h-px w-20 bg-static/20 animate-flicker [animation-delay:1s]" />
      <div className="absolute bottom-10 right-8 text-[10px] uppercase tracking-[0.4em] text-blood/40 animate-flicker [animation-delay:3s]">
        rec ●
      </div>
    </div>
  );
}
