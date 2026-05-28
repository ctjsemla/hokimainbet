import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => ({
  locale: locale ?? "id",
  messages: (await import(`./messages/${locale ?? "id"}.json`)).default,
}));
