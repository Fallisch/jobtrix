"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Header({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || "/");
  }

  const other = locale === "de" ? "en" : "de";

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="text-xl font-bold tracking-wide hover:text-accent transition-colors"
        >
          JobTRIX
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href={`/${locale}/profile`}
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            {locale === "de" ? "Profil" : "Profile"}
          </Link>
          <button
            onClick={() => switchLocale(other)}
            className="text-sm font-medium text-white/50 hover:text-white transition-colors uppercase tracking-wide"
            aria-label={`Switch to ${other === "de" ? "Deutsch" : "English"}`}
          >
            {other}
          </button>
        </nav>
      </div>
    </header>
  );
}
