"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { status } = useSession();
  const t = useTranslations("nav");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/theme")
      .then((res) => res.json())
      .then((data: { themePreference?: string }) => {
        if (data.themePreference && data.themePreference !== theme) {
          setTheme(data.themePreference);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function toggleTheme() {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);

    if (status === "authenticated") {
      fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreference: next }),
      });
    }
  }

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? t("toggleToLight") : t("toggleToDark");

  return (
    <button
      onClick={toggleTheme}
      aria-label={label}
      className="text-white/80 hover:text-white transition-colors"
    >
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 1-9-9Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}
