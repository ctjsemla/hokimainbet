import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.[a-zA-Z]+$/)
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has locale
  const hasLocale = pathname.startsWith("/id") || pathname.startsWith("/en");

  if (!hasLocale) {
    // Redirect to default locale
    return NextResponse.redirect(
      new URL(`/id${pathname}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
