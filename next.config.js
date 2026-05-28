const withNextIntl = require("next-intl/plugin")("./i18n.ts");

module.exports = withNextIntl({
  poweredByHeader: false,
  compress: true,
});
