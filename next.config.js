const withNextIntl = require("next-intl/plugin")("./i18n.ts");
const isDev = process.env.NODE_ENV === "development";

module.exports = withNextIntl({
  distDir: isDev ? ".next-dev" : ".next",
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.slotslaunch.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "slotslaunch.com",
        pathname: "/**",
      },
    ],
  },
});
