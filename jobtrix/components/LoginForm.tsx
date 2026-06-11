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

      router.push(`/${locale}/profile`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>

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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={t("emailLabel")}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{t(`errors.email.${errors.email}`)}</p>
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={t("passwordLabel")}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{t(`errors.password.${errors.password}`)}</p>
            )}
          </div>

          {submitError && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
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
          <Link href={`/${locale}/register`} className="text-accent hover:underline">
            {t("registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
