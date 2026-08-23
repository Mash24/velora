import { isValidAdminToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login" || pathname === "/api/admin/login";
  const isAdminSurface = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminSurface || isLogin) {
    return NextResponse.next();
  }

  const token = request.cookies.get("velora_admin")?.value;
  if (await isValidAdminToken(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
