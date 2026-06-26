"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);

  function switchLocale(next: string) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || "/");
    setMenuOpen(false);
  }

  function handleLogout() {
    signOut({ callbackUrl: `/${locale}` });
    setMenuOpen(false);
  }

  const other = locale === "de" ? "en" : "de";

  const navLinks = (
    <>
      {/* prefetch={false} auf geschuetzten Routen: verhindert, dass Next.js sie
          im ausgeloggten Zustand prefetcht und den Login-Redirect cached (#134). */}
      {status === "authenticated" && (
        <Link
          href={`/${locale}/profile`}
          prefetch={false}
          onClick={() => setMenuOpen(false)}
          className="text-sm font-medium text-white/80 hover:text-white hover:scale-105 transition-all min-h-[44px] min-w-[44px] flex items-center"
        >
          {locale === "de" ? "Profil" : "Profile"}
        </Link>
      )}
      {status === "authenticated" && (
        <Link
          href={`/${locale}/generate`}
          prefetch={false}
          onClick={() => setMenuOpen(false)}
          className="text-sm font-medium text-white/80 hover:text-white hover:scale-105 transition-all min-h-[44px] min-w-[44px] flex items-center"
        >
          {t("startApplication")}
        </Link>
      )}
      {status === "authenticated" && (
        <Link
          href={`/${locale}/application-history`}
          prefetch={false}
          onClick={() => setMenuOpen(false)}
          className="text-sm font-medium text-white/80 hover:text-white hover:scale-105 transition-all min-h-[44px] min-w-[44px] flex items-center"
        >
          {t("applicationHistory")}
        </Link>
      )}
      {status === "authenticated" && (
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-white/80 hover:text-white hover:scale-105 transition-all min-h-[44px] min-w-[44px] flex items-center"
        >
          {t("logout")}
        </button>
      )}
      {status === "unauthenticated" && (
        <Link
          href={`/${locale}/login`}
          onClick={() => setMenuOpen(false)}
          className="text-sm font-medium text-white/80 hover:text-white hover:scale-105 transition-all min-h-[44px] min-w-[44px] flex items-center"
        >
          {locale === "de" ? "Anmelden" : "Login"}
        </Link>
      )}
      <button
        onClick={() => switchLocale(other)}
        className="text-sm font-medium text-white/50 hover:text-white transition-colors uppercase tracking-wide min-h-[44px] min-w-[44px] flex items-center"
        aria-label={`Switch to ${other === "de" ? "Deutsch" : "English"}`}
      >
        {locale}
      </button>
      <ThemeToggle />
    </>
  );

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="text-xl font-bold tracking-wide hover:text-accent hover:scale-105 transition-all"
        >
          JobTRIX
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Menu"
          aria-expanded={menuOpen}
          data-testid="hamburger-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        data-testid="mobile-menu"
      >
        <nav className="flex flex-col gap-1 px-4 pb-4">
          {navLinks}
        </nav>
      </div>
    </header>
  );
}
