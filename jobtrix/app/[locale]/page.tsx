"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { loadProfile } from "@/lib/profile-storage";

export default function Home() {
  const t = useTranslations("home");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string ?? "de";

  useEffect(() => {
    if (!loadProfile()) {
      router.replace(`/${locale}/profile`);
    }
  }, [locale, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
        {t("headline")}
      </h1>
      <p className="text-lg text-text/70 max-w-xl mb-8">
        {t("subline")}
      </p>
      <Link
        href={`/${locale}/profile`}
        className="bg-accent text-white px-8 py-3 rounded-full font-semibold text-base hover:brightness-110 transition"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
