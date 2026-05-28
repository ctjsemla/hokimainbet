import type { MDXComponents } from "mdx/types";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function getTextContent(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  }
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    children.props &&
    typeof children.props === "object" &&
    "children" in children.props
  ) {
    return getTextContent(children.props.children as ReactNode);
  }
  return "";
}

export const mdxComponents: MDXComponents = {
  h2: ({ children, ...props }) => {
    const id = slugify(getTextContent(children));
    return (
      <h2
        id={id}
        className="mb-4 mt-12 scroll-mt-28 font-display text-4xl tracking-wide text-orange-500 first:mt-0"
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const id = slugify(getTextContent(children));
    return (
      <h3
        id={id}
        className="mb-3 mt-8 scroll-mt-28 text-2xl font-semibold text-white"
        {...props}
      >
        {children}
      </h3>
    );
  },
  p: ({ children, ...props }) => (
    <p
      className="mb-5 text-lg leading-loose text-[#cbd5e1]"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="mb-6 list-disc space-y-2 pl-6 text-lg leading-loose text-[#cbd5e1]"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mb-6 list-decimal space-y-2 pl-6 text-lg leading-loose text-[#cbd5e1]"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-8 border-l-4 border-orange-500 bg-navy-900/50 py-4 pl-6 pr-4 italic text-[#94a3b8]"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code
          className={cn(
            "block overflow-x-auto rounded-lg bg-navy-800 p-4 font-mono text-sm text-orange-400",
            className,
          )}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-navy-800 px-1.5 py-0.5 font-mono text-sm text-orange-400"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre className="my-6 overflow-x-auto rounded-lg" {...props}>
      {children}
    </pre>
  ),
  a: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className="text-orange-500 underline-offset-2 transition-colors hover:underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-white" {...props}>
      {children}
    </strong>
  ),
};
