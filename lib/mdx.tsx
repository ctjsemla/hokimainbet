import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";
import { mdxComponents } from "@/components/blog/mdx-components";

export async function renderMdx(
  source: string,
): Promise<{ content: ReactElement }> {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
    },
  });

  return { content };
}
