"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const TOTAL_STEPS = 5;

export default function OnboardingForm() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "de";
  const { data: session } = useSession();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [nameError, setNameError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleNext() {
    if (step === 1 && !name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSkip() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  async function handleFinish() {
    setSubmitting(true);
    const dd = birthDay.padStart(2, "0");
    const mm = birthMonth.padStart(2, "0");
    const birthdate = birthYear && birthMonth && birthDay ? `${birthYear}-${mm}-${dd}` : "";

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

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-6 space-y-6">
        {step === 1 && (
          <h1 className="text-2xl font-bold text-primary dark:text-accent text-center">
            {t("welcome")}
          </h1>
        )}

        <div className="space-y-1">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text/50 text-center">
            {t("stepOf", { current: step, total: TOTAL_STEPS })}
          </p>
        </div>

        <div className="min-h-[140px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step1Title")}</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(false); }}
                placeholder={t("step1Placeholder")}
                autoFocus
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={t("step1Title")}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
              {nameError && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{t("step1Error")}</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step2Title")}</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("step2Placeholder")}
                autoFocus
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={t("step2Title")}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step3Title")}</h2>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("step3Placeholder")}
                autoFocus
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={t("step3Title")}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step4Title")}</h2>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("step4Placeholder")}
                autoFocus
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={t("step4Title")}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step5Title")}</h2>
              <div className="flex gap-3 justify-center">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  placeholder={t("step5Day")}
                  autoFocus
                  className="w-20 border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-3 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label={t("step5Day")}
                />
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  placeholder={t("step5Month")}
                  className="w-24 border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-3 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label={t("step5Month")}
                />
                <input
                  type="number"
                  min="1920"
                  max="2020"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder={t("step5Year")}
                  className="w-28 border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-3 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label={t("step5Year")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-text/60 hover:text-text transition"
            >
              {t("back")}
            </button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-sm text-text/50 hover:text-text transition"
                >
                  {t("skip")}
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="bg-accent text-white px-8 py-2.5 rounded-full font-semibold hover:brightness-110 transition"
              >
                {t("next")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="bg-accent text-white px-8 py-2.5 rounded-full font-semibold hover:brightness-110 transition disabled:opacity-40"
            >
              {t("finish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
