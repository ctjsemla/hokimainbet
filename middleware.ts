import { createServerClient } from "@supabase/auth-helpers-nextjs";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

function isGamesRoute(pathname: string): boolean {
  return (
    pathname === "/games" ||
    pathname.startsWith("/games/") ||
    /^\/(id|en)\/games(\/|$)/.test(pathname)
  );
}

function localeFromPathname(pathname: string): "id" | "en" {
  return pathname.startsWith("/en") ? "en" : "id";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = intlMiddleware(request);

  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  if (!isGamesRoute(pathname) || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return response;
  }

  const locale = localeFromPathname(pathname);
  const loginUrl = new URL(`/${locale}/auth/login`, request.url);
  loginUrl.searchParams.set("redirect", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/",
    "/(id|en)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
