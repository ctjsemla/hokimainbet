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

const BLOG_ROOT_DIR = path.join(process.cwd(), "content/blog");

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

function getBlogDirectory(locale?: string): string {
  if (!locale || locale === "id") {
    return BLOG_ROOT_DIR;
  }

  const localizedDir = path.join(BLOG_ROOT_DIR, locale);
  if (fs.existsSync(localizedDir)) {
    return localizedDir;
  }

  return BLOG_ROOT_DIR;
}

function getPostFiles(locale?: string): string[] {
  const blogDir = getBlogDirectory(locale);
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  return fs.readdirSync(blogDir).filter((file) => file.endsWith(".mdx"));
}

function parsePostFile(filename: string, locale?: string): BlogPost | null {
  const slug = filename.replace(/\.mdx$/, "");
  const blogDir = getBlogDirectory(locale);
  const filePath = path.join(blogDir, filename);
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

export function getAllPosts(locale?: string): BlogPostMeta[] {
  return getPostFiles(locale)
    .map((file) => parsePostFile(file, locale))
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

export function getPostBySlug(slug: string, locale?: string): BlogPost | null {
  const blogDir = getBlogDirectory(locale);
  const localizedPath = path.join(blogDir, `${slug}.mdx`);
  if (fs.existsSync(localizedPath)) {
    return parsePostFile(`${slug}.mdx`, locale);
  }

  if (locale && locale !== "id") {
    const fallbackPath = path.join(BLOG_ROOT_DIR, `${slug}.mdx`);
    if (fs.existsSync(fallbackPath)) {
      return parsePostFile(`${slug}.mdx`);
    }
  }

  if (!locale) {
    const defaultPath = path.join(BLOG_ROOT_DIR, `${slug}.mdx`);
    if (fs.existsSync(defaultPath)) {
      return parsePostFile(`${slug}.mdx`);
    }
  }

  return null;
}

export function getAllPostSlugs(locale?: string): string[] {
  if (!locale) {
    const allFiles = [
      ...getPostFiles("id"),
      ...getPostFiles("en"),
    ].map((file) => file.replace(/\.mdx$/, ""));
    return Array.from(new Set(allFiles));
  }

  const files = getPostFiles(locale);
  if (files.length === 0 && locale !== "id") {
    return getPostFiles("id").map((file) => file.replace(/\.mdx$/, ""));
  }

  return files.map((file) => file.replace(/\.mdx$/, ""));
}

export function getRelatedPosts(
  slug: string,
  category: BlogCategory,
  limit = 3,
  locale?: string,
): BlogPostMeta[] {
  return getAllPosts(locale)
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
