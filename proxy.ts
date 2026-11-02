import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/adminToken";

export async function proxy(request: NextRequest) {
  if (process.env.DEMO_MODE === "1") {
    return NextResponse.next({ request });
  }

  const isLoginRoute = request.nextUrl.pathname === "/admin/login";
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;

  let isAdmin = false;
  if (token && secret && adminEmail) {
    const email = await verifyAdminToken(token, secret);
    isAdmin = !!email && email.toLowerCase() === adminEmail.toLowerCase();
  }

  if (request.nextUrl.pathname.startsWith("/admin") && !isLoginRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLoginRoute && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/admin/:path*"],
};
