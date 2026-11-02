"use client";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    // Recarga completa para que el proxy (middleware) vea que la cookie ya no está.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="ml-auto shrink-0 text-foreground/60"
    >
      Salir
    </button>
  );
}
