import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["id", "en"],
  defaultLocale: "id",
  localePrefix: "always",
});

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
