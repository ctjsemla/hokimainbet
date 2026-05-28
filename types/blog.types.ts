export const BLOG_CATEGORIES = [
  "Strategy",
  "Guide",
  "Crypto",
  "Sports",
  "News",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  category: BlogCategory;
  date: string;
  author: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
}

export interface BlogPostMeta extends BlogPostFrontmatter {
  slug: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}
