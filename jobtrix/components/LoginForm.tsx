"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { validateLogin, LoginErrors } from "@/lib/auth-validation";

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "de";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const errs = validateLogin({ email, password });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setSubmitError("invalidCredentials");
        return;
      }

      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const profile = await profileRes.json();
        if (!profile.name) {
          router.push(`/${locale}/onboarding`);
          return;
        }
      }
      router.push(`/${locale}/generate`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-6 space-y-6">
        <h1 className="text-2xl font-bold text-primary dark:text-accent">{t("title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              {t("emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 min-h-[44px] text-base focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={t("emailLabel")}
            />
            {errors.email && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t(`errors.email.${errors.email}`)}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 pr-10 min-h-[44px] text-base focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={t("passwordLabel")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text/40 hover:text-text/70 transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t(`errors.password.${errors.password}`)}</p>
            )}
            <p className="text-sm text-right mt-1">
              <Link href={`/${locale}/forgot-password`} className="text-accent hover:underline">
                {t("forgotPasswordLink")}
              </Link>
            </p>
          </div>

          {submitError && (
            <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
              {t(`errors.${submitError}`)}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-white px-8 py-3 rounded-full font-semibold text-base hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
          >
            {t("submit")}
          </button>
        </form>

        <p className="text-sm text-text/70 text-center">
          <Link href={`/${locale}/register`} className="text-accent hover:underline">
            {t("registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
