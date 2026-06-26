"use client";

import { useTranslations } from "next-intl";

const badgeIcons = [
  // Server/Hosting
  <svg key="hosting" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><circle cx="6" cy="6" r="1" /><circle cx="6" cy="18" r="1" /></svg>,
  // Shield/DSGVO
  <svg key="dsgvo" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>,
  // Lock/Encryption
  <svg key="encryption" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  // CreditCard/Payment
  <svg key="payment" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  // User/Data
  <svg key="data" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
];

const badgeKeys = ["hosting", "dsgvo", "encryption", "payment", "data"] as const;

export default function TrustBadges() {
  const t = useTranslations("trustBadges");

  return (
    <div className="flex flex-wrap justify-center gap-6 py-4">
      {badgeKeys.map((key, i) => (
        <div key={key} className="flex items-center gap-2 text-sm text-text/60">
          <span className="text-accent">{badgeIcons[i]}</span>
          <span>{t(key)}</span>
        </div>
      ))}
    </div>
  );
}
