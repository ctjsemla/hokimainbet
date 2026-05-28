import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BlogListing } from "@/components/blog/BlogListing";
import { getAllPosts } from "@/lib/blog";
import { blogListUrl } from "@/lib/site";

interface BlogPageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: BlogPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "blog" });
  const canonical = blogListUrl(locale);

  return {
    title: `${t("metaTitle")} | HokiMainbet`,
    description: t("metaDescription"),
    alternates: { canonical },
    openGraph: {
      title: `${t("metaTitle")} | HokiMainbet`,
      description: t("metaDescription"),
      url: canonical,
      type: "website",
      locale: locale === "en" ? "en_US" : "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t("metaTitle")} | HokiMainbet`,
      description: t("metaDescription"),
    },
  };
}

export default function BlogPage({ params: { locale } }: BlogPageProps) {
  const posts = getAllPosts(locale);

  return <BlogListing posts={posts} locale={locale} />;
}
