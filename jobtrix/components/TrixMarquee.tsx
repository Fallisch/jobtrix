"use client";

import { useTranslations } from "next-intl";

export default function TrixMarquee() {
  const t = useTranslations("marquee");
  const phrases = [t("phrase0"), t("phrase1")];

  const items = Array.from({ length: 8 }, (_, i) => phrases[i % phrases.length]);

  return (
    <div className="overflow-hidden w-full py-3" aria-hidden="true">
      <div className="marquee-track flex whitespace-nowrap uppercase tracking-widest text-sm text-accent/60">
        <span className="marquee-content inline-flex items-center">
          {items.map((phrase, i) => (
            <span key={i} className="inline-flex items-center">
              <span>{phrase}</span>
              <span className="mx-12 opacity-40">·</span>
            </span>
          ))}
        </span>
        <span className="marquee-content inline-flex items-center">
          {items.map((phrase, i) => (
            <span key={i} className="inline-flex items-center">
              <span>{phrase}</span>
              <span className="mx-12 opacity-40">·</span>
            </span>
          ))}
        </span>
      </div>
      <style jsx>{`
        .marquee-track {
          animation: marquee-scroll 40s linear infinite;
        }
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (max-width: 640px) {
          .marquee-track {
            animation-duration: 9s;
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
