"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthBrandingPanel } from "@/components/auth/AuthBrandingPanel";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { AuthFormPanel } from "@/components/auth/AuthFormPanel";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { Link, useRouter } from "@/i18n/navigation";
import { signIn } from "@/lib/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

function LoginFormPanel() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!email.trim()) {
      next.email = t("errors.emailRequired");
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = t("errors.emailFormat");
    }

    if (!password) {
      next.password = t("errors.passwordRequired");
    }

    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      triggerShake();
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await signIn(email.trim(), password);
      setSuccessFlash(true);
      await new Promise((r) => setTimeout(r, 450));

      if (redirectTo) {
        const path = redirectTo.replace(/^\/(id|en)/, "") || "/";
        router.push(path);
      } else {
        router.push("/");
      }

      router.refresh();
    } catch {
      setErrors({ form: t("errors.generic") });
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      visualSide="left"
      successFlash={successFlash}
      visual={<AuthBrandingPanel />}
      form={
        <AuthFormPanel>
            <h1 className="font-display text-5xl leading-none tracking-wide text-white lg:text-[48px]">
              {t("heroTitle")}
            </h1>
            <p className="mt-2 font-sans text-sm text-[#94a3b8]">{t("subtitle")}</p>

            <m.form
              onSubmit={handleSubmit}
              animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-8 space-y-5"
            >
              {errors.form && (
                <p className="font-sans text-sm text-orange-400">{errors.form}</p>
              )}

              <AuthFormField
                id="email"
                label={t("email")}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder={t("emailPlaceholder")}
                error={errors.email}
                autoComplete="email"
              />

              <AuthPasswordField
                id="password"
                label={t("password")}
                value={password}
                onChange={setPassword}
                placeholder={t("passwordPlaceholder")}
                error={errors.password}
              />

              <AuthSubmitButton
                label={t("submit")}
                loadingLabel={t("submitting")}
                loading={submitting}
              />
            </m.form>

            <p className="mt-6 font-sans text-sm text-[#94a3b8]">
              {t("noAccount")}{" "}
              <Link
                href="/auth/register"
                className="font-medium text-orange-500 transition-colors hover:text-orange-400"
              >
                {t("registerLink")}
              </Link>
            </p>

            <p className="mt-8 font-sans text-xs text-[#64748b]">{t("terms")}</p>
        </AuthFormPanel>
      }
    />
  );
}

export function LoginForm() {
  return <LoginFormPanel />;
}
