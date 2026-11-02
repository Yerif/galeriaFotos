// Cookie de sesión de admin firmada con HMAC (Web Crypto, funciona en Edge y Node).
// No es un login real: solo verifica que el valor fue firmado por el servidor
// con ADMIN_SESSION_SECRET, para una sola persona administradora.
export const ADMIN_COOKIE_NAME = "admin_session";

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string) {
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function createAdminToken(email: string, secret: string) {
  const key = await getKey(secret);
  const payload = toBase64Url(new TextEncoder().encode(email));
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifyAdminToken(token: string, secret: string): Promise<string | null> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  try {
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(payload)
    );
    if (!valid) return null;
    return new TextDecoder().decode(fromBase64Url(payload));
  } catch {
    return null;
  }
}
