"use client";

import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { formatPostDate } from "@/lib/blog-format";
import type { BlogPostMeta } from "@/types/blog.types";
import { BlogSearch } from "./BlogSearch";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "./CategoryFilter";
import { BlogCover } from "./BlogCover";
import { CategoryBadge } from "./CategoryBadge";

interface BlogListingProps {
  posts: BlogPostMeta[];
  locale: string;
}

export function BlogListing({ posts, locale }: BlogListingProps) {
  const t = useTranslations("blog");
  const [category, setCategory] = useState<CategoryFilterValue>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory =
        category === "All" || post.category === category;
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [posts, category, query]);

  const hero = filtered[0];
  const second = filtered[1];
  const third = filtered[2];
  const fourth = filtered[3];
  const remaining = filtered.slice(4);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 md:px-8 md:pt-10">
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-400">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-5xl tracking-wide text-white md:text-6xl">
            {t("title")}
          </h1>
        </div>
        <BlogSearch value={query} onChange={setQuery} />
      </header>

      <div className="mb-10">
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <m.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center text-[#94a3b8]"
          >
            {t("noResults")}
          </m.p>
        ) : (
          <m.div
            key={`${category}-${query}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-16"
          >
            {hero && (
              <Link
                href={`/blog/${hero.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-navy-800"
              >
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 15% 80%, rgba(249,115,22,0.12) 0%, transparent 50%),
                      radial-gradient(circle at 85% 20%, rgba(26,51,96,0.9) 0%, transparent 40%),
                      repeating-linear-gradient(
                        -12deg,
                        transparent,
                        transparent 48px,
                        rgba(15,32,64,0.35) 48px,
                        rgba(15,32,64,0.35) 49px
                      )
                    `,
                  }}
                />
                <div className="relative grid gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16">
                  <div className="flex flex-col justify-end">
                    <CategoryBadge category={hero.category} />
                    <h2 className="mt-4 font-display text-[52px] leading-[0.95] tracking-wide text-white transition-colors group-hover:text-orange-400 md:text-[72px]">
                      {hero.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#94a3b8]">
                      {hero.description}
                    </p>
                    <p className="mt-6 flex items-center gap-3 text-sm text-[#94a3b8]">
                      <span>{formatPostDate(hero.date, locale)}</span>
                      <span aria-hidden>·</span>
                      <span>{hero.readTime}</span>
                      <ArrowUpRight className="ml-auto h-5 w-5 text-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </p>
                  </div>
                  <BlogCover
                    category={hero.category}
                    title={hero.title}
                    readTime={hero.readTime}
                    className="rounded-xl"
                  />
                </div>
              </Link>
            )}

            {(second || third) && (
              <div className="grid gap-8 lg:grid-cols-5">
                {second && (
                  <Link
                    href={`/blog/${second.slug}`}
                    className="group flex flex-col lg:col-span-3"
                  >
                    <BlogCover
                      category={second.category}
                      title={second.title}
                      readTime={second.readTime}
                      className="mb-6 rounded-xl"
                    />
                    <CategoryBadge category={second.category} />
                    <h3 className="mt-3 font-display text-4xl leading-tight text-white group-hover:text-orange-400 md:text-5xl">
                      {second.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-[#94a3b8]">
                      {second.description}
                    </p>
                    <p className="mt-4 text-sm text-[#94a3b8]">
                      {formatPostDate(second.date, locale)} · {second.readTime}
                    </p>
                  </Link>
                )}
                <div className="flex flex-col gap-8 lg:col-span-2">
                  {[third, fourth].filter(Boolean).map((post) => (
                    <Link
                      key={post!.slug}
                      href={`/blog/${post!.slug}`}
                      className="group flex gap-4 border-t border-navy-800 pt-6 first:border-t-0 first:pt-0 lg:flex-col lg:gap-0"
                    >
                      <BlogCover
                        category={post!.category}
                        title={post!.title}
                        readTime={post!.readTime}
                        size="sm"
                        className="h-24 w-32 shrink-0 rounded-lg lg:mb-4 lg:h-auto lg:w-full"
                      />
                      <div>
                        <CategoryBadge
                          category={post!.category}
                          className="mb-2 scale-90 origin-left"
                        />
                        <h3 className="font-display text-2xl leading-tight text-white group-hover:text-orange-400">
                          {post!.title}
                        </h3>
                        <p className="mt-2 text-xs text-[#94a3b8]">
                          {formatPostDate(post!.date, locale)} ·{" "}
                          {post!.readTime}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {remaining.length > 0 && (
              <div className="space-y-12">
                {remaining.map((post, index) => {
                  const pattern = index % 3;

                  if (pattern === 0) {
                    return (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group grid items-center gap-8 border-t border-navy-800 pt-12 md:grid-cols-12"
                      >
                        <BlogCover
                          category={post.category}
                          title={post.title}
                          readTime={post.readTime}
                          className="rounded-xl md:col-span-5"
                        />
                        <div className="md:col-span-7">
                          <span className="font-display text-6xl text-navy-700">
                            {String(index + 5).padStart(2, "0")}
                          </span>
                          <CategoryBadge
                            category={post.category}
                            className="mt-2"
                          />
                          <h3 className="mt-2 font-display text-4xl text-white group-hover:text-orange-400">
                            {post.title}
                          </h3>
                          <p className="mt-3 text-[#94a3b8]">{post.description}</p>
                        </div>
                      </Link>
                    );
                  }

                  if (pattern === 1) {
                    return (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group block border-t border-navy-800 pt-12"
                      >
                        <div className="flex flex-col justify-between gap-6 rounded-2xl bg-navy-900 p-8 md:flex-row md:items-center">
                          <div className="max-w-2xl">
                            <CategoryBadge category={post.category} />
                            <h3 className="mt-3 font-display text-4xl text-white group-hover:text-orange-400">
                              {post.title}
                            </h3>
                            <p className="mt-2 text-[#94a3b8]">{post.description}</p>
                          </div>
                          <BlogCover
                            category={post.category}
                            title={post.title}
                            readTime={post.readTime}
                            size="sm"
                            className="h-40 w-full shrink-0 rounded-lg md:w-64"
                          />
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group grid gap-6 border-t border-navy-800 pt-12 md:grid-cols-2 md:gap-12"
                    >
                      <div className="md:order-2">
                        <CategoryBadge category={post.category} />
                        <h3 className="mt-3 font-display text-5xl leading-tight text-white group-hover:text-orange-400">
                          {post.title}
                        </h3>
                        <p className="mt-4 text-lg text-[#94a3b8]">
                          {post.description}
                        </p>
                        <p className="mt-4 text-sm text-[#94a3b8]">
                          {formatPostDate(post.date, locale)} · {post.readTime}
                        </p>
                      </div>
                      <BlogCover
                        category={post.category}
                        title={post.title}
                        readTime={post.readTime}
                        className="rounded-xl md:order-1"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
