import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/adminToken";

export async function getAdminSession() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!secret || !adminEmail) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  const email = await verifyAdminToken(token, secret);
  if (!email || email.toLowerCase() !== adminEmail.toLowerCase()) return null;

  return { email };
}
