export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-2 border-blood/30 border-t-blood ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}
