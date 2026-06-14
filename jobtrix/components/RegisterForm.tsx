"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { validateRegistration, RegistrationErrors } from "@/lib/auth-validation";

export default function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "de";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const errs = validateRegistration({ email, password, passwordConfirm, termsAccepted });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error === "emailTaken" ? "emailTaken" : "generic");
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setSubmitError("generic");
        return;
      }

      router.push(`/${locale}/profile`);
    } catch {
      setSubmitError("generic");
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
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={t("passwordLabel")}
            />
            {errors.password && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t(`errors.password.${errors.password}`)}</p>
            )}
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-1">
              {t("passwordConfirmLabel")}
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={t("passwordConfirmLabel")}
            />
            {errors.passwordConfirm && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t(`errors.passwordConfirm.${errors.passwordConfirm}`)}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-text/70">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
              />
              {t("termsLabel")}
            </label>
            {errors.termsAccepted && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t(`errors.termsAccepted.${errors.termsAccepted}`)}</p>
            )}
          </div>

          {submitError && (
            <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
              {t(`errors.${submitError}`)}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-white px-8 py-3 rounded-full font-semibold text-base hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("submit")}
          </button>
        </form>

        <p className="text-sm text-text/70 text-center">
          <Link href={`/${locale}/login`} className="text-accent hover:underline">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
