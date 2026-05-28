import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["id", "en"],
  defaultLocale: "id",
  localePrefix: "always",
});

export function middleware(request: NextRequest) {
  try {
    // Skip middleware for static files and api routes
    const pathname = request.nextUrl.pathname;
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    return intlMiddleware(request);
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next|api|.*\\..*).*)",
  ],
};
