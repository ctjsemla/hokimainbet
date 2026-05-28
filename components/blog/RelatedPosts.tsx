"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPostDate } from "@/lib/blog-format";
import type { BlogPostMeta } from "@/types/blog.types";
import { BlogCover } from "./BlogCover";
import { CategoryBadge } from "./CategoryBadge";

interface RelatedPostsProps {
  posts: BlogPostMeta[];
  locale: string;
  variant?: "sidebar" | "grid";
}

export function RelatedPosts({
  posts,
  locale,
  variant = "grid",
}: RelatedPostsProps) {
  const t = useTranslations("blog");

  if (posts.length === 0) {
    return null;
  }

  if (variant === "sidebar") {
    return (
      <div>
        <p className="mb-4 font-display text-xl tracking-wide text-white">
          {t("relatedPosts")}
        </p>
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-lg border border-navy-800 bg-navy-900/50 transition-colors hover:border-navy-700"
              >
                <BlogCover
                  category={post.category}
                  title={post.title}
                  readTime={post.readTime}
                  size="sm"
                />
                <div className="p-3">
                  <p className="text-xs text-[#94a3b8]">
                    {formatPostDate(post.date, locale)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section>
      <h2 className="mb-6 font-display text-4xl tracking-wide text-white">
        {t("relatedPosts")}
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={`group flex flex-col overflow-hidden rounded-xl border border-navy-800 bg-navy-900 transition-colors hover:border-orange-500/40 ${
              index === 1 ? "md:mt-8" : ""
            }`}
          >
            <BlogCover
              category={post.category}
              title={post.title}
              readTime={post.readTime}
              size="sm"
            />
            <div className="p-5">
              <CategoryBadge category={post.category} className="mb-2" />
              <p className="line-clamp-2 text-sm text-[#94a3b8]">
                {post.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
