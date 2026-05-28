"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthFormPanel } from "@/components/auth/AuthFormPanel";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import {
  AuthRegisterMobileBanner,
} from "@/components/auth/AuthRegisterMobileBanner";
import { AuthRegisterVisual } from "@/components/auth/AuthRegisterVisual";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { Link, useRouter } from "@/i18n/navigation";
import { signUp } from "@/lib/auth";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  age?: string;
  form?: string;
}

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "en" ? "en" : "id";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
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

    if (!username.trim()) {
      next.username = t("errors.usernameRequired");
    } else if (!USERNAME_PATTERN.test(username.trim())) {
      next.username = t("errors.usernameFormat");
    }

    if (!email.trim()) {
      next.email = t("errors.emailRequired");
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = t("errors.emailFormat");
    }

    if (!password) {
      next.password = t("errors.passwordRequired");
    } else if (password.length < 8) {
      next.password = t("errors.passwordLength");
    }

    if (!ageConfirmed) {
      next.age = t("errors.ageRequired");
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
      const result = await signUp(
        email.trim(),
        password,
        username.trim(),
        newsletter,
      );
      setSuccessFlash(true);
      await new Promise((r) => setTimeout(r, 450));
      if (!result.session) throw new Error("missing session");
      router.push("/");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("already registered")) {
        setErrors({ form: t("errors.emailExists") });
      } else {
      setErrors({ form: t("errors.generic") });
      }
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="lg:hidden">
        <AuthRegisterMobileBanner />
      </div>

      <AuthSplitLayout
        visualSide="right"
        successFlash={successFlash}
        visual={<AuthRegisterVisual />}
        form={
          <AuthFormPanel>
              <h1 className="font-display text-[42px] leading-none tracking-wide text-white">
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
                  id="username"
                  label={t("username")}
                  value={username}
                  onChange={setUsername}
                  placeholder={t("usernamePlaceholder")}
                  hint={t("usernameHint")}
                  error={errors.username}
                  autoComplete="username"
                />

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
                  showStrength
                />

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-navy-700 bg-navy-800 accent-orange-500"
                  />
                  <span className="font-sans text-sm text-[#cbd5e1]">{t("ageConfirm")}</span>
                </label>
                {errors.age && (
                  <p className="-mt-3 font-sans text-sm text-orange-400">{errors.age}</p>
                )}

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-navy-700 bg-navy-800 accent-orange-500"
                  />
                  <span className="font-sans text-sm text-[#cbd5e1]">{t("newsletter")}</span>
                </label>

                <AuthSubmitButton
                  label={t("submit")}
                  loadingLabel={t("submitting")}
                  loading={submitting}
                />
              </m.form>

              <p className="mt-6 font-sans text-sm text-[#94a3b8]">
                {t("hasAccount")}{" "}
                <Link
                  href={`/${locale}/auth/login`}
                  className="font-medium text-orange-500 transition-colors hover:text-orange-400"
                >
                  {t("loginLink")}
                </Link>
              </p>
          </AuthFormPanel>
        }
      />
    </>
  );
}
