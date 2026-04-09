import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((request) => {
  const isLoggedIn = Boolean(request.auth?.user);
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/api/auth");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAuthRoute) {
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isAdminRoute && request.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
