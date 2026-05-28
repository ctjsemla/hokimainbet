import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

export default function RootPage() {
  const localeCookie = cookies().get("NEXT_LOCALE")?.value;
  if (localeCookie === "en" || localeCookie === "id") {
    redirect(`/${localeCookie}`);
  }

  const acceptLanguage = headers().get("accept-language")?.toLowerCase() ?? "";
  const fallbackLocale = acceptLanguage.includes("en") ? "en" : "id";
  redirect(`/${fallbackLocale}`);
}
