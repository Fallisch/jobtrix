"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function OnboardingForm() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "de";
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [nameError, setNameError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email,
          phone,
          address,
          birthdate,
          photo: null,
          education: [],
          experience: [],
          qualifications: [],
          interests: [],
        }),
      });

      if (res.ok) {
        router.push(`/${locale}/generate`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-accent">{t("title")}</h1>
          <p className="text-sm text-text/70 mt-1">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="onb-name" className="block text-sm font-medium mb-1">
              {t("nameLabel")}
            </label>
            <input
              id="onb-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(false); }}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={t("nameLabel")}
            />
            {nameError && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t("errors.nameRequired")}</p>
            )}
          </div>

          <div>
            <label htmlFor="onb-email" className="block text-sm font-medium mb-1">
              {t("emailLabel")}
            </label>
            <input
              id="onb-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={t("emailLabel")}
            />
          </div>

          <div>
            <label htmlFor="onb-phone" className="block text-sm font-medium mb-1">
              {t("phoneLabel")}
            </label>
            <input
              id="onb-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={t("phoneLabel")}
            />
          </div>

          <div>
            <label htmlFor="onb-address" className="block text-sm font-medium mb-1">
              {t("addressLabel")}
            </label>
            <input
              id="onb-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={t("addressLabel")}
            />
          </div>

          <div>
            <label htmlFor="onb-birthdate" className="block text-sm font-medium mb-1">
              {t("birthdateLabel")}
            </label>
            <input
              id="onb-birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={t("birthdateLabel")}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-white px-8 py-3 rounded-full font-semibold text-base hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={t("submit")}
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
