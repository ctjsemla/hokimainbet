import { absoluteUrl, blogPostUrl } from "@/lib/site";
import type { BlogPostMeta } from "@/types/blog.types";

interface ArticleJsonLdProps {
  post: BlogPostMeta;
  locale: string;
  imageUrl?: string;
}

export function ArticleJsonLd({
  post,
  locale,
  imageUrl,
}: ArticleJsonLdProps) {
  const url = blogPostUrl(locale, post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    ...(imageUrl ? { image: imageUrl } : {}),
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "HokiMainbet",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/favicon.ico"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    inLanguage: locale === "en" ? "en-US" : "id-ID",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
