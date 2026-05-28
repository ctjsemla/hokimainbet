import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const posts = getAllPosts();
  const now = new Date();

  const staticPaths = ["", "/blog"];

  const staticEntries = routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("daily" as const),
      priority: path === "" ? 1 : 0.9,
    })),
  );

  const gamePaths = [
    "/games/crash",
    "/games/dice",
    "/games/mines",
    "/games/plinko",
  ];

  const gameEntries = routing.locales.flatMap((locale) =>
    gamePaths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  const blogEntries = routing.locales.flatMap((locale) =>
    posts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  return [...staticEntries, ...gameEntries, ...blogEntries];
}
