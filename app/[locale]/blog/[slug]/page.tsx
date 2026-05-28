import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArticleJsonLd } from "@/components/blog/ArticleJsonLd";
import { BlogCover } from "@/components/blog/BlogCover";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { PostBottomCta } from "@/components/blog/PostBottomCta";
import { PostMeta } from "@/components/blog/PostMeta";
import { PostSidebar } from "@/components/blog/PostSidebar";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { ShareButtons } from "@/components/blog/ShareButtons";
import {
  extractHeadings,
  getAllPostSlugs,
  getOgImageUrl,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";
import { formatPostDate } from "@/lib/blog-format";
import { renderMdx } from "@/lib/mdx";
import { blogPostUrl } from "@/lib/site";
import { routing } from "@/i18n/routing";

interface BlogPostPageProps {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  const slugs = Array.from(
    new Set(routing.locales.flatMap((locale) => getAllPostSlugs(locale))),
  );
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params: { locale, slug },
}: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(slug, locale);
  if (!post) {
    return { title: "Not Found | HokiMainbet" };
  }

  const canonical = blogPostUrl(locale, slug);
  const imageUrl = getOgImageUrl(post);
  const ogImages = imageUrl
    ? [{ url: imageUrl, width: 1200, height: 630, alt: post.title }]
    : undefined;

  return {
    title: `${post.title} | HokiMainbet`,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      ...(ogImages ? { images: ogImages } : {}),
      locale: locale === "en" ? "en_US" : "id_ID",
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default async function BlogPostPage({
  params: { locale, slug },
}: BlogPostPageProps) {
  const post = getPostBySlug(slug, locale);
  if (!post) {
    notFound();
  }

  const { content } = await renderMdx(post.content);
  const headings = extractHeadings(post.content);
  const related = getRelatedPosts(slug, post.category, 3, locale);
  const shareUrl = blogPostUrl(locale, slug);
  const imageUrl = getOgImageUrl(post);
  const t = await getTranslations({ locale, namespace: "blog" });

  return (
    <>
      <ArticleJsonLd post={post} locale={locale} imageUrl={imageUrl} />

      <article className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-8 md:pt-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          <div className="min-w-0">
            <CategoryBadge category={post.category} />
            <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white md:text-[64px]">
              {post.title}
            </h1>

            <PostMeta post={post} locale={locale} className="mt-6" />

            <BlogCover
              category={post.category}
              title={post.title}
              readTime={post.readTime}
              className="mt-10 rounded-2xl"
            />

            <div className="prose-blog mt-12 max-w-none">{content}</div>

            <div className="mt-14 border-t border-navy-800 pt-8">
              <ShareButtons url={shareUrl} title={post.title} />
            </div>

            <div className="mt-16">
              <RelatedPosts posts={related} locale={locale} variant="grid" />
            </div>

            <div className="mt-16">
              <PostBottomCta locale={locale} />
            </div>
          </div>

          <PostSidebar
            headings={headings}
            related={related.slice(0, 3)}
            locale={locale}
          />
        </div>

        <p className="sr-only">
          {t("published")} {formatPostDate(post.date, locale)}
        </p>
      </article>
    </>
  );
}
