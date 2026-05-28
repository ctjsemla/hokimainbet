const withNextIntl = require("next-intl/plugin")("./i18n.ts");
const createMDX = require("@next/mdx");

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    domains: [],
    unoptimized: false,
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = withNextIntl(withMDX(nextConfig));
