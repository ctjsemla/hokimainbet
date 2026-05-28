import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SoundProvider } from "@/components/providers/SoundProvider";
import { PageLoader } from "@/components/ui/PageLoader";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "HokiMainbet",
  description: "HokiMainbet — premium gaming experience",
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  if (!routing.locales.includes(locale as "id" | "en")) {
    notFound();
  }

  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <body
        className="bg-navy-950 font-sans text-white antialiased"
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MotionProvider>
            <ErrorBoundary>
              <AuthProvider>
                <SoundProvider>
                  <Suspense fallback={<PageLoader />}>
                    <AppShell>{children}</AppShell>
                  </Suspense>
                </SoundProvider>
              </AuthProvider>
            </ErrorBoundary>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
