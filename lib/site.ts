const DEFAULT_SITE_URL = "https://hokimainbet.com";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function blogPostUrl(locale: string, slug: string): string {
  return absoluteUrl(`/${locale}/blog/${slug}`);
}

export function blogListUrl(locale: string): string {
  return absoluteUrl(`/${locale}/blog`);
}
