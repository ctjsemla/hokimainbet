import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BlogCover } from "@/components/blog/BlogCover";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { formatPostDate } from "@/lib/blog-format";
import type { BlogPostMeta } from "@/types/blog.types";

interface HomeBlogSectionProps {
  posts: BlogPostMeta[];
  locale: string;
}

export async function HomeBlogSection({
  posts,
  locale,
}: HomeBlogSectionProps) {
  const t = await getTranslations("home");

  if (posts.length === 0) {
    return null;
  }

  const [featured, ...rest] = posts;

  return (
    <section className="border-t border-navy-800 px-6 py-20 md:px-12 md:py-28">
      <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="heading-display text-[48px] md:text-[64px]">
          {t("blogHeading")}
        </h2>
        <Link
          href="/blog"
          className="btn-press text-sm font-semibold text-orange-500 hover:text-orange-400"
        >
          {t("blogViewAll")} →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="panel-interactive group overflow-hidden lg:col-span-7"
          >
            <BlogCover
              category={featured.category}
              title={featured.title}
              readTime={featured.readTime}
              className="rounded-t-2xl"
            />
            <div className="p-6 md:p-8">
              <CategoryBadge category={featured.category} />
              <p className="mt-3 line-clamp-2 text-[#94a3b8]">
                {featured.description}
              </p>
              <p className="mt-4 text-xs text-[#64748b]">
                {formatPostDate(featured.date, locale)}
              </p>
            </div>
          </Link>
        )}

        <div className="flex flex-col gap-4 lg:col-span-5">
          {rest.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`panel-interactive group overflow-hidden ${
                index === 1 ? "lg:mt-8" : ""
              }`}
            >
              <BlogCover
                category={post.category}
                title={post.title}
                readTime={post.readTime}
                size="sm"
                className="rounded-t-xl"
              />
              <div className="p-5">
                <CategoryBadge
                  category={post.category}
                  className="mb-2 scale-90 origin-left"
                />
                <p className="mt-2 text-xs text-[#64748b]">
                  {formatPostDate(post.date, locale)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
