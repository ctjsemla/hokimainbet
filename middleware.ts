import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const locales = ["id", "en"];
  const defaultLocale = "id";

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return NextResponse.next();

  return NextResponse.redirect(
    new URL(`/${defaultLocale}${pathname === "/" ? "" : pathname}`, request.url),
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|robots.txt|sitemap.xml|.*\\..*).*)"],
};
