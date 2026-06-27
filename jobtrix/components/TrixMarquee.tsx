"use client";

import { useTranslations } from "next-intl";

export default function TrixMarquee() {
  const t = useTranslations("marquee");
  const phrases = [t("phrase0"), t("phrase1")];

  const items = Array.from({ length: 6 }, (_, i) => phrases[i % phrases.length]);

  return (
    <div className="overflow-hidden w-full py-3" style={{ contain: "content" }} aria-hidden="true">
      <div className="marquee-track flex whitespace-nowrap uppercase tracking-widest text-sm text-accent/60">
        <span className="marquee-content inline-flex items-center">
          {items.map((phrase, i) => (
            <span key={i} className="inline-flex items-center">
              <span>{phrase}</span>
              <span className="mx-8 sm:mx-12 opacity-40">·</span>
            </span>
          ))}
        </span>
        <span className="marquee-content inline-flex items-center">
          {items.map((phrase, i) => (
            <span key={i} className="inline-flex items-center">
              <span>{phrase}</span>
              <span className="mx-8 sm:mx-12 opacity-40">·</span>
            </span>
          ))}
        </span>
      </div>
      <style jsx>{`
        .marquee-track {
          animation: marquee-scroll 30s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .marquee-content {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        @keyframes marquee-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @media (max-width: 640px) {
          .marquee-track {
            animation-duration: 8s;
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
