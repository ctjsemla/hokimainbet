import { formatPostDate } from "@/lib/blog-format";
import type { BlogPostMeta } from "@/types/blog.types";
import { CategoryBadge } from "./CategoryBadge";

interface PostMetaProps {
  post: BlogPostMeta;
  locale: string;
  className?: string;
}

export function PostMeta({ post, locale, className }: PostMetaProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#94a3b8] ${className ?? ""}`}
    >
      <CategoryBadge category={post.category} />
      <span>{formatPostDate(post.date, locale)}</span>
      <span aria-hidden>·</span>
      <span>{post.readTime}</span>
      <span aria-hidden>·</span>
      <span>{post.author}</span>
    </div>
  );
}
