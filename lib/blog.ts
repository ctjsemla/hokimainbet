import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { absoluteUrl } from "@/lib/site";
import {
  BLOG_CATEGORIES,
  type BlogCategory,
  type BlogPost,
  type BlogPostMeta,
  type TocHeading,
} from "@/types/blog.types";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function isBlogCategory(value: string): value is BlogCategory {
  return (BLOG_CATEGORIES as readonly string[]).includes(value);
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parsePostFile(filename: string): BlogPost | null {
  const slug = filename.replace(/\.mdx$/, "");
  const filePath = path.join(BLOG_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const category = String(data.category ?? "Guide");
  if (!isBlogCategory(category)) {
    return null;
  }

  const tags = Array.isArray(data.tags)
    ? data.tags.map((tag: unknown) => String(tag))
    : [];

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    category,
    date: String(data.date ?? ""),
    author: String(data.author ?? "HokiMainbet Team"),
    readTime: String(data.readTime ?? "5 min"),
    tags,
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    content: content.trim(),
  };
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"));

  return files
    .map((file) => parsePostFile(file))
    .filter((post): post is BlogPost => post !== null)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .map(
      ({
        slug,
        title,
        description,
        category,
        date,
        author,
        readTime,
        tags,
        coverImage,
      }) => ({
        slug,
        title,
        description,
        category,
        date,
        author,
        readTime,
        tags,
        coverImage,
      }),
    );
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return parsePostFile(`${slug}.mdx`);
}

export function getAllPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

export function getRelatedPosts(
  slug: string,
  category: BlogCategory,
  limit = 3,
): BlogPostMeta[] {
  return getAllPosts()
    .filter((post) => post.slug !== slug && post.category === category)
    .slice(0, limit);
}

export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/\*\*/g, "").trim();
    const id = slugifyHeading(text);

    headings.push({ id, text, level });
  }

  return headings;
}

export function getOgImageUrl(post: BlogPostMeta): string | undefined {
  if (!post.coverImage) {
    return undefined;
  }
  return post.coverImage.startsWith("http")
    ? post.coverImage
    : absoluteUrl(post.coverImage);
}
