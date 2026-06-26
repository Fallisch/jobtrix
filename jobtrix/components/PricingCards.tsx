"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { PackageType } from "@/lib/pricing";
import TrixMarquee from "@/components/TrixMarquee";

interface PricingCardsProps {
  config: {
    limited: { priceEur: number; durationDays: number };
    lifetime: { priceEur: number };
    monthly: { priceEur: number };
    yearly: { priceEur: number };
  };
  navigate?: (url: string) => void;
  status?: "success" | "cancelled" | null;
}

export default function PricingCards({
  config,
  navigate = (url: string) => {
    window.location.href = url;
  },
  status = null,
}: PricingCardsProps) {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [loadingPackage, setLoadingPackage] = useState<PackageType | null>(null);

  const formatPrice = (priceEur: number) =>
    new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
      style: "currency",
      currency: "EUR",
    }).format(priceEur);

  async function handleBuy(pkg: PackageType) {
    setError(null);
    setLoadingPackage(pkg);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: pkg }),
      });
      if (!res.ok) {
        setError(t("checkoutError"));
        setLoadingPackage(null);
        return;
      }
      const data = await res.json();
      navigate(data.url);
    } catch {
      setError(t("checkoutError"));
      setLoadingPackage(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary dark:text-accent">{t("title")}</h1>
        <p className="text-sm text-text/70">{t("subtitle")}</p>
      </div>
      <TrixMarquee />
      {error && (
        <div role="alert" className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      {status === "success" && (
        <div role="status" className="mb-6 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 px-4 py-3 text-green-700 dark:text-green-300 text-sm">
          {t("checkoutSuccess")}
        </div>
      )}
      {status === "cancelled" && (
        <div role="status" className="mb-6 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-4 py-3 text-amber-700 dark:text-amber-300 text-sm">
          {t("checkoutCancelled")}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
          <h2 className="text-xl font-bold text-primary dark:text-accent">{t("limited.title")}</h2>
          <p className="text-3xl font-bold text-text">{formatPrice(config.limited.priceEur)}</p>
          <p className="text-sm text-text/70">{t("limited.duration", { days: config.limited.durationDays })}</p>
          <ul className="flex flex-col gap-2 text-sm text-text/80">
            <li>{t("limited.feature1")}</li>
            <li>{t("limited.feature2")}</li>
            <li>{t("limited.feature3")}</li>
          </ul>
          <button
            type="button"
            onClick={() => handleBuy("limited")}
            disabled={loadingPackage !== null}
            className="mt-auto w-full bg-accent text-white px-8 py-3 rounded-full font-semibold text-base hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("limited.buyButton")}
          </button>
        </div>

        <div className="relative rounded-2xl bg-white dark:bg-surface border-2 border-accent p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
          <span className="absolute -top-3 right-6 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
            {t("recommendedBadge")}
          </span>
          <h2 className="text-xl font-bold text-primary dark:text-accent">{t("lifetime.title")}</h2>
          <p className="text-3xl font-bold text-text">{formatPrice(config.lifetime.priceEur)}</p>
          <p className="text-sm text-text/70">{t("lifetime.duration")}</p>
          <ul className="flex flex-col gap-2 text-sm text-text/80">
            <li>{t("lifetime.feature1")}</li>
            <li>{t("lifetime.feature2")}</li>
            <li>{t("lifetime.feature3")}</li>
            <li>{t("lifetime.feature4")}</li>
          </ul>
          <button
            type="button"
            onClick={() => handleBuy("lifetime")}
            disabled={loadingPackage !== null}
            className="mt-auto w-full bg-accent text-white px-8 py-3 rounded-full font-semibold text-base hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("lifetime.buyButton")}
          </button>
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-text/60">{t("secureNote")}</p>
    </div>
  );
}
