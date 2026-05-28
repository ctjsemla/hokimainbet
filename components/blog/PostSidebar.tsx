import { AffiliateButton } from "@/components/ui/AffiliateButton";
import type { BlogPostMeta, TocHeading } from "@/types/blog.types";
import { RelatedPosts } from "./RelatedPosts";
import { TableOfContents } from "./TableOfContents";

interface PostSidebarProps {
  headings: TocHeading[];
  related: BlogPostMeta[];
  locale: string;
}

export function PostSidebar({
  headings,
  related,
  locale,
}: PostSidebarProps) {
  return (
    <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
      <TableOfContents headings={headings} />
      <div className="rounded-xl border border-navy-800 bg-navy-900 p-6">
        <AffiliateButton size="lg" className="w-full justify-center font-display tracking-wide" />
      </div>
      <RelatedPosts posts={related} locale={locale} variant="sidebar" />
    </aside>
  );
}
