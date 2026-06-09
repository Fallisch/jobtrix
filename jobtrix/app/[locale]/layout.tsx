import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import InstallBanner from "@/components/InstallBanner";

export const metadata: Metadata = {
  title: "JobTRIX",
  description: "Bewerbungen professionell erstellen und versenden",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JobTRIX",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A5F",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "de" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header locale={locale} />
      <main>{children}</main>
      <InstallBanner />
    </NextIntlClientProvider>
  );
}
