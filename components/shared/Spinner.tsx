export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-2 border-pumpkin/30 border-t-pumpkin ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}
