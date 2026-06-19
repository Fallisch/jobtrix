"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { validateResetPassword, ResetPasswordErrors } from "@/lib/auth-validation";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations("auth.resetPassword");
  const params = useParams();
  const locale = (params?.locale as string) ?? "de";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [invalidToken, setInvalidToken] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const errs = validateResetPassword({ password, passwordConfirm });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "invalid_token") {
          setInvalidToken(true);
        } else {
          setSubmitError("generic");
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("generic");
    } finally {
      setSubmitting(false);
    }
  }

  if (invalidToken) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-6 space-y-6">
          <h1 className="text-2xl font-bold text-primary dark:text-accent">{t("invalidTokenTitle")}</h1>
          <p className="text-text/80">{t("invalidTokenMessage")}</p>
          <p className="text-sm text-text/70 text-center">
            <Link href={`/${locale}/forgot-password`} className="text-accent hover:underline">
              {t("forgotPasswordLink")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-6 space-y-6">
        <h1 className="text-2xl font-bold text-primary dark:text-accent">{t("title")}</h1>

        {submitted ? (
          <>
            <p className="text-text/80">{t("successMessage")}</p>
            <p className="text-sm text-text/70 text-center">
              <Link href={`/${locale}/login`} className="text-accent hover:underline">
                {t("loginLink")}
              </Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className="text-text/50 text-xs mt-1">{t("passwordHint")}</p>
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
        )}
      </div>
    </div>
  );
}
