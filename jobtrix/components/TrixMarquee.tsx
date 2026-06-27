"use client";

import { useTranslations } from "next-intl";

export default function TrixMarquee() {
  const t = useTranslations("marquee");
  const phrases = [t("phrase0"), t("phrase1")];

  const content = phrases.join(" • ") + " • ";

  return (
    <div className="overflow-hidden w-full py-3" aria-hidden="true">
      <div className="marquee-track flex whitespace-nowrap uppercase tracking-widest text-sm text-accent/60">
        <span className="marquee-content inline-block">{content}</span>
        <span className="marquee-content inline-block">{content}</span>
      </div>
      <style jsx>{`
        .marquee-track {
          animation: marquee-scroll 30s linear infinite;
        }
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
