import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminToken } from "@/lib/adminToken";

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!secret || !adminEmail) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const { email } = await request.json();

  if (typeof email !== "string" || email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
    return NextResponse.json({ error: "not_admin" }, { status: 401 });
  }

  const token = await createAdminToken(adminEmail, secret);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
