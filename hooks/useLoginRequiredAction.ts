"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function useLoginRequiredAction() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();

  const loginRequiredMessage = t("loginRequiredToPlay");

  function goToLogin() {
    const redirect = pathname || "/";
    router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
  }

  function requireLogin(
    isLoggedIn: boolean,
    onBlocked?: (message: string) => void,
  ): boolean {
    if (isLoggedIn) return true;
    onBlocked?.(loginRequiredMessage);
    return false;
  }

  return {
    loginRequiredMessage,
    goToLogin,
    requireLogin,
  };
}
