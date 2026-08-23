import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const protectedRoutes = ["/dashboard", "/admin"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute) {
    const cookie = request.cookies.get("session")?.value;
    const session = await decrypt(cookie);

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAdminRoute && session.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect root to dashboard or login
  if (path === "/") {
    const cookie = request.cookies.get("session")?.value;
    const session = await decrypt(cookie);
    if (session) {
      if (session.role === "SUPERADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
