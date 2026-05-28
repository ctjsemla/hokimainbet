const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n.ts");
const createMDX = require("@next/mdx");

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  experimental: {
    serverComponentsExternalPackages: [],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/id",
        permanent: false,
      },
    ];
  },
  images: {
    domains: [],
    unoptimized: false,
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = withNextIntl(withMDX(nextConfig));
